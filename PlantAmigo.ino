// ============================================================
//  MEU PLANTAMIGO - ESP32
//  Tela TFT + sensor de umidade + bomba + site (app) no proprio ESP
//
//  A bomba SO liga em 2 casos:
//    1) clique em "Regar agora" no app (se a terra precisar)
//    2) irrigacao AUTOMATICA (se o modo estiver automatico)
//  A quantidade de agua e controlada por jatos curtos + espera
//  + conferencia da umidade, com limite de regas por ciclo.
// ============================================================

// ATENCAO: WiFi/WebServer/LittleFS precisam vir ANTES da TFT_eSPI,
// porque a TFT_eSPI desliga os nomes curtos "FS" e "File".
#include <WiFi.h>
#include <WebServer.h>
#include <LittleFS.h>
#include <ESPmDNS.h>
#include <TFT_eSPI.h>
#include <Preferences.h>
#include <sys/time.h>
#include <time.h>

TFT_eSPI tft = TFT_eSPI();
WebServer server(80);
Preferences prefs;

// ------------------------------------------------------------
// CONFIGURACAO DO USUARIO
// ------------------------------------------------------------
// Wi-Fi proprio do ESP (modo AP): conecte o celular nele.
const char* WIFI_AP_SSID   = "PlantAmigo";
const char* WIFI_AP_SENHA  = "plantamigo123";   // minimo 8 caracteres

// (Opcional) tambem conectar no Wi-Fi da sua casa. Deixe "" para ignorar.
const char* WIFI_STA_SSID  = "";
const char* WIFI_STA_SENHA = "";

// Pinos
const int PINO_SENSOR = 34;   // ADC1 (funciona com Wi-Fi ligado)
const int PINO_RELE   = 18;
const int RELE_LIGADO    = HIGH;   // se o seu modulo for "ativo em LOW", troque
const int RELE_DESLIGADO = LOW;

// Calibracao do sensor (valores brutos do analogRead)
const int SENSOR_SECO   = 3284;   // 0%
const int SENSOR_MOLHADO = 1500;  // 100%
// Leitura fora disso = sensor desconectado / em curto -> bomba bloqueada
const int SENSOR_BRUTO_MIN_VALIDO = 300;
const int SENSOR_BRUTO_MAX_VALIDO = 4090;

// Reservatorio (ESTIMADO pelo tempo que a bomba trabalhou)
const float RESERVATORIO_ML        = 500.0;  // capacidade total
const float VAZAO_ML_POR_SEG       = 25.0;   // MEDIR com a sua bomba!
const int   RESERVATORIO_MIN_PCT   = 5;      // abaixo disso a bomba nao liga

// Tempos
const unsigned long TEMPO_ESPERA       = 120000; // espera a agua se espalhar
const unsigned long INTERVALO_LEITURA  = 1000;
const unsigned long JATO_MAXIMO_MS     = 5000;   // trava de seguranca absoluta
const int MAX_REGAS = 3;                          // jatos por ciclo

// ------------------------------------------------------------
// PERFIL POR TIPO DE PLANTA (quantidade certa de agua)
//   seca      : ate esse % a planta esta com sede (liga o automatico)
//   alvo      : o ciclo de rega termina quando chega nesse %
//   encharcada: acima disso ja e agua demais
//   jatoMs    : duracao do 1o jato / jatoCurtoMs: jato de ajuste
// O perfil "tropicais" e igual ao seu codigo original (20 / 45 / 60).
// Os outros sao valores iniciais: ajuste depois de observar a planta.
// ------------------------------------------------------------
struct Perfil {
  const char* nome;
  int seca;
  int alvo;
  int encharcada;
  unsigned long jatoMs;
  unsigned long jatoCurtoMs;
};

const Perfil PERFIS[] = {
  { "cactos",      8, 25, 40, 1000,  500 },
  { "suculentas", 10, 30, 45, 1000,  500 },
  { "tropicais",  20, 45, 60, 2000, 1000 },
  { "floridas",   25, 45, 65, 2000, 1000 },
  { "samambaias", 25, 50, 70, 2000, 1000 },
  { "orquideas",  15, 35, 50, 1500,  750 },
  { "temperos",   20, 45, 60, 2000, 1000 },
  { "frutiferas", 25, 45, 65, 2000, 1000 }
};
const int NUM_PERFIS = sizeof(PERFIS) / sizeof(PERFIS[0]);
const int PERFIL_PADRAO = 2;  // tropicais

// ------------------------------------------------------------
// CORES ORIGINAIS
// ------------------------------------------------------------
const uint16_t FUNDO = 0x218B;
const uint16_t AZUL_CLARO = 0x9EFF;
const uint16_t AZUL_ESCURO = 0x194D;
const uint16_t ROSA = 0xE4FB;
const uint16_t BRANCO = TFT_WHITE;
const uint16_t VERMELHO = TFT_RED;
const uint16_t PRETO = TFT_BLACK;

// ------------------------------------------------------------
// ESTADOS
// ------------------------------------------------------------
enum EstadoIrrigacao { NORMAL, REGANDO, AGUARDANDO, ALERTA };
enum Origem { ORIGEM_AUTO = 0, ORIGEM_MANUAL = 1 };
enum MotivoAlerta { ALERTA_NENHUM, ALERTA_UMIDADE, ALERTA_RESERVATORIO, ALERTA_SENSOR };

EstadoIrrigacao estadoIrrigacao = NORMAL;
Origem origemCiclo = ORIGEM_AUTO;
MotivoAlerta motivoAlerta = ALERTA_NENHUM;

int estadoAtual = -1;
int umidadeAtual = -1;
int leituraBruta = 0;
bool sensorOk = true;
int contadorRegas = 0;
float mlCiclo = 0;

// configuracao guardada na memoria (sobrevive a reinicio)
bool configurado = false;     // false ate o app mandar a 1a configuracao
bool modoAutomatico = false;  // padrao SEGURO: manual
int tipoIdx = PERFIL_PADRAO;
float reservatorioMl = RESERVATORIO_ML;

unsigned long ultimaLeitura = 0;
unsigned long ultimoPiscar = 0;
unsigned long inicioPiscar = 0;
unsigned long inicioRega = 0;
unsigned long inicioEspera = 0;
unsigned long duracaoRega = 0;
unsigned long ultimaAnimacao = 0;

bool olhosFechados = false;
int nivelBateria = 0;

// historico de regas (mais nova no indice 0)
struct Rega {
  uint32_t epoch;     // hora real (0 = ainda sem hora)
  uint32_t uptime;    // segundos desde o boot quando ocorreu
  uint16_t ml;        // agua estimada
  uint8_t tipo;       // Origem
  uint8_t desteBoot;  // 1 = ocorreu neste boot (da pra corrigir a hora)
};
const int HIST_MAX = 8;
Rega historico[HIST_MAX];
int numHistorico = 0;

const Perfil& perfilAtual() { return PERFIS[tipoIdx]; }

// ============================================================
// TELA (codigo original)
// ============================================================

// DESENHA UM OLHO
void desenharOlho(int x, int y, bool fechado, int estado) {

  tft.fillRect(x - 55, y - 65, 110, 122, FUNDO);

  if (fechado) {
    tft.drawWideLine(
      x - 29, y, x + 29, y,
      7, AZUL_CLARO, FUNDO
    );
  } else {
    tft.fillCircle(x, y, 42, AZUL_CLARO);
    tft.fillCircle(x, y, 28, AZUL_ESCURO);

    tft.fillCircle(x - 11, y - 12, 12, BRANCO);
    tft.fillCircle(x + 10, y + 10, 5, AZUL_CLARO);
  }

  tft.drawWideLine(
    x - 31, y - 31, x - 43, y - 45,
    4, AZUL_CLARO, FUNDO
  );

  tft.drawWideLine(
    x - 13, y - 42, x - 19, y - 55,
    4, AZUL_CLARO, FUNDO
  );

  tft.drawWideLine(
    x + 13, y - 42, x + 19, y - 55,
    4, AZUL_CLARO, FUNDO
  );

  if (estado == 0 && !fechado) {

    if (x < 160) {
      tft.drawWideLine(
        x - 27, y - 51, x + 21, y - 37,
        6, AZUL_CLARO, FUNDO
      );
    } else {
      tft.drawWideLine(
        x - 21, y - 37, x + 27, y - 51,
        6, AZUL_CLARO, FUNDO
      );
    }
  }
}

// BOCHECHAS
void desenharBochechas() {
  tft.fillEllipse(24, 155, 16, 9, ROSA);
  tft.fillEllipse(296, 155, 16, 9, ROSA);
}

// BOCA
void desenharBoca(int estado) {

  tft.fillRect(115, 130, 90, 59, FUNDO);

  if (estado == 0) {
    tft.drawWideLine(
      139, 164, 160, 146,
      7, AZUL_CLARO, FUNDO
    );
    tft.drawWideLine(
      160, 146, 181, 164,
      7, AZUL_CLARO, FUNDO
    );

  } else if (estado == 1) {
    tft.drawWideLine(
      137, 163, 148, 149,
      7, AZUL_CLARO, FUNDO
    );
    tft.drawWideLine(
      148, 149, 172, 149,
      7, AZUL_CLARO, FUNDO
    );
    tft.drawWideLine(
      172, 149, 183, 163,
      7, AZUL_CLARO, FUNDO
    );

  } else {
    tft.drawWideLine(
      139, 139, 149, 153,
      8, AZUL_CLARO, FUNDO
    );
    tft.drawWideLine(
      149, 153, 171, 153,
      8, AZUL_CLARO, FUNDO
    );
    tft.drawWideLine(
      171, 153, 181, 139,
      8, AZUL_CLARO, FUNDO
    );
  }
}

void atualizarOlhos(bool fechados) {
  desenharOlho(90, 90, fechados, estadoAtual);
  desenharOlho(230, 90, fechados, estadoAtual);
  desenharBochechas();
}

void atualizarExpressao() {
  atualizarOlhos(olhosFechados);
  desenharBoca(estadoAtual);
}

void mostrarUmidade(int umidade) {

  tft.fillRect(0, 193, 320, 47, FUNDO);
  tft.setTextColor(BRANCO, FUNDO);
  tft.setTextSize(3);

  String texto = "Umid: " + String(umidade) + "%";
  int larguraTexto = texto.length() * 18;
  int posX = (320 - larguraTexto) / 2;

  tft.setCursor(posX, 201);
  tft.print(texto);
}

// Carinha conforme o perfil da planta.
// (com o perfil "tropicais" fica identico ao codigo original:
//  <21 triste | 21-45 neutra | 46-60 feliz | >60 triste)
int definirEstado(int umidade) {

  const Perfil& p = perfilAtual();

  if (umidade <= p.seca) return 0;
  if (umidade <= p.alvo) return 1;
  if (umidade <= p.encharcada) return 2;

  return 0;
}

// TELA DA BATERIA
void desenharBateria() {

  tft.fillRect(80, 35, 160, 115, FUNDO);

  // CONTORNO
  tft.drawRoundRect(
    95, 55, 125, 65, 8, BRANCO
  );

  tft.fillRect(220, 76, 10, 23, BRANCO);

  // INTERIOR
  tft.fillRect(100, 60, 115, 55, FUNDO);

  int largura = nivelBateria * 27;

  if (largura > 0) {
    tft.fillRoundRect(
      103, 63, largura, 49, 5, AZUL_CLARO
    );
  }

  nivelBateria++;

  if (nivelBateria > 4) {
    nivelBateria = 0;
  }
}

void mostrarTelaIrrigacao() {

  tft.fillScreen(FUNDO);

  nivelBateria = 0;
  desenharBateria();

  tft.setTextColor(BRANCO, FUNDO);
  tft.setTextSize(2);

  tft.setCursor(52, 155);
  tft.print("Regando a planta");

  tft.setCursor(48, 185);
  tft.print("Checando umidade");

  ultimaAnimacao = millis();
}

// TELA DE ALERTA (texto sem acento: a fonte da TFT nao tem)
void mostrarAlerta(const char* texto) {

  tft.fillScreen(FUNDO);

  // TRIANGULO VERMELHO
  tft.drawWideLine(
    160, 25, 65, 175,
    12, VERMELHO, FUNDO
  );

  tft.drawWideLine(
    65, 175, 255, 175,
    12, VERMELHO, FUNDO
  );

  tft.drawWideLine(
    255, 175, 160, 25,
    12, VERMELHO, FUNDO
  );

  // EXCLAMACAO
  tft.fillRoundRect(153, 75, 14, 55, 6, BRANCO);
  tft.fillCircle(160, 148, 8, BRANCO);

  tft.setTextColor(BRANCO, FUNDO);
  tft.setTextSize(2);

  int largura = strlen(texto) * 12;
  tft.setCursor((320 - largura) / 2, 198);
  tft.print(texto);
}

// RESTAURA AS CARINHAS
void voltarTelaNormal() {

  tft.fillScreen(FUNDO);

  olhosFechados = false;
  estadoAtual = definirEstado(umidadeAtual);

  atualizarExpressao();
  mostrarUmidade(umidadeAtual);

  ultimoPiscar = millis();
}

// Mostra como conectar (so no boot)
void mostrarTelaConexao(const String& ip) {

  tft.fillScreen(FUNDO);
  tft.setTextColor(BRANCO, FUNDO);

  tft.setTextSize(3);
  tft.setCursor(40, 20);
  tft.print("PlantAmigo");

  tft.setTextSize(2);
  tft.setCursor(10, 80);
  tft.print("Wi-Fi: ");
  tft.print(WIFI_AP_SSID);

  tft.setCursor(10, 110);
  tft.print("Senha: ");
  tft.print(WIFI_AP_SENHA);

  tft.setCursor(10, 150);
  tft.print("Abra no celular:");

  tft.setTextSize(3);
  tft.setCursor(10, 180);
  tft.print(ip);
}

// ============================================================
// MEMORIA (Preferences)
// ============================================================

void salvarHistorico() {
  prefs.putUChar("nh", (uint8_t)numHistorico);
  prefs.putBytes("hist", historico, sizeof(historico));
}

void salvarConfig() {
  prefs.putBool("cfg", configurado);
  prefs.putBool("auto", modoAutomatico);
  prefs.putUChar("tipo", (uint8_t)tipoIdx);
}

void salvarReservatorio() {
  prefs.putFloat("resMl", reservatorioMl);
}

void carregarMemoria() {

  prefs.begin("plantamigo", false);

  configurado = prefs.getBool("cfg", false);
  modoAutomatico = prefs.getBool("auto", false);
  tipoIdx = prefs.getUChar("tipo", PERFIL_PADRAO);
  if (tipoIdx >= NUM_PERFIS) tipoIdx = PERFIL_PADRAO;

  reservatorioMl = prefs.getFloat("resMl", RESERVATORIO_ML);
  if (reservatorioMl < 0) reservatorioMl = 0;
  if (reservatorioMl > RESERVATORIO_ML) reservatorioMl = RESERVATORIO_ML;

  numHistorico = prefs.getUChar("nh", 0);
  if (numHistorico > HIST_MAX) numHistorico = 0;
  if (numHistorico > 0 &&
      prefs.getBytesLength("hist") == sizeof(historico)) {
    prefs.getBytes("hist", historico, sizeof(historico));
    for (int i = 0; i < numHistorico; i++) historico[i].desteBoot = 0;
  } else {
    numHistorico = 0;
  }
}

// ============================================================
// HORA (vem do celular)
// ============================================================

bool horaValida() {
  return (uint32_t)time(nullptr) > 1700000000UL;
}

void definirHora(uint32_t epoch) {

  struct timeval tv;
  tv.tv_sec = epoch;
  tv.tv_usec = 0;
  settimeofday(&tv, nullptr);

  // conserta regas que aconteceram antes de o celular informar a hora
  uint32_t upAgora = millis() / 1000;
  bool mudou = false;

  for (int i = 0; i < numHistorico; i++) {
    if (historico[i].epoch == 0 && historico[i].desteBoot) {
      historico[i].epoch = epoch - (upAgora - historico[i].uptime);
      mudou = true;
    }
  }

  if (mudou) salvarHistorico();
}

void registrarRega(Origem origem) {

  for (int i = HIST_MAX - 1; i > 0; i--) historico[i] = historico[i - 1];

  historico[0].epoch = horaValida() ? (uint32_t)time(nullptr) : 0;
  historico[0].uptime = millis() / 1000;
  historico[0].ml = 0;
  historico[0].tipo = origem;
  historico[0].desteBoot = 1;

  if (numHistorico < HIST_MAX) numHistorico++;

  salvarHistorico();
}

// ============================================================
// SENSOR E RESERVATORIO
// ============================================================

// LEITURA DO SENSOR (media de 8 amostras)
int lerUmidade() {

  long soma = 0;
  for (int i = 0; i < 8; i++) {
    soma += analogRead(PINO_SENSOR);
    delayMicroseconds(300);
  }

  int leitura = soma / 8;
  leituraBruta = leitura;

  sensorOk = (leitura >= SENSOR_BRUTO_MIN_VALIDO &&
              leitura <= SENSOR_BRUTO_MAX_VALIDO);

  Serial.print("Valor bruto: ");
  Serial.println(leitura);

  int umidade = map(leitura, SENSOR_SECO, SENSOR_MOLHADO, 0, 100);

  return constrain(umidade, 0, 100);
}

int pctReservatorio() {
  int pct = (int)(reservatorioMl * 100.0 / RESERVATORIO_ML + 0.5);
  return constrain(pct, 0, 100);
}

bool reservatorioOk() {
  return pctReservatorio() > RESERVATORIO_MIN_PCT;
}

const char* nomeUmidade() {
  const Perfil& p = perfilAtual();
  if (!sensorOk) return "sensor";
  if (umidadeAtual <= p.seca) return "seca";
  if (umidadeAtual > p.encharcada) return "encharcada";
  return "adequada";
}

// ============================================================
// IRRIGACAO
// ============================================================

void bombaLigar()    { digitalWrite(PINO_RELE, RELE_LIGADO); }
void bombaDesligar() { digitalWrite(PINO_RELE, RELE_DESLIGADO); }

// INICIA UM JATO
void iniciarRega(unsigned long tempo) {

  if (tempo > JATO_MAXIMO_MS) tempo = JATO_MAXIMO_MS;

  duracaoRega = tempo;
  inicioRega = millis();

  contadorRegas++;
  estadoIrrigacao = REGANDO;

  bombaLigar();

  Serial.print("INICIANDO REGA ");
  Serial.println(contadorRegas);

  Serial.print("Duracao: ");
  Serial.print(tempo);
  Serial.println(" ms");

  if (contadorRegas == 1) {
    mostrarTelaIrrigacao();
  }
}

// FINALIZA UM JATO
void finalizarRega() {

  bombaDesligar();

  unsigned long ligada = millis() - inicioRega;
  float ml = (ligada / 1000.0) * VAZAO_ML_POR_SEG;

  reservatorioMl -= ml;
  if (reservatorioMl < 0) reservatorioMl = 0;
  salvarReservatorio();

  mlCiclo += ml;
  if (numHistorico > 0) {
    historico[0].ml = (uint16_t)(mlCiclo + 0.5);
    salvarHistorico();
  }

  estadoIrrigacao = AGUARDANDO;
  inicioEspera = millis();

  Serial.println("BOMBA DESLIGADA");
  Serial.println("AGUARDANDO 2 MINUTOS");
}

// COMECA UM CICLO NOVO (1o jato)
void iniciarCiclo(Origem origem) {

  contadorRegas = 0;
  origemCiclo = origem;
  motivoAlerta = ALERTA_NENHUM;
  mlCiclo = 0;

  registrarRega(origem);
  iniciarRega(perfilAtual().jatoMs);
}

// FINALIZA O CICLO
void finalizarCiclo() {

  bombaDesligar();

  contadorRegas = 0;
  motivoAlerta = ALERTA_NENHUM;
  estadoIrrigacao = NORMAL;

  Serial.println("UMIDADE ADEQUADA");
  Serial.println("CICLO FINALIZADO");

  voltarTelaNormal();
}

void entrarAlerta(MotivoAlerta motivo) {

  bombaDesligar();

  estadoIrrigacao = ALERTA;
  motivoAlerta = motivo;

  Serial.print("ALERTA ATIVADO: ");
  Serial.println((int)motivo);

  if (motivo == ALERTA_RESERVATORIO) {
    mostrarAlerta("Reservatorio vazio");
  } else if (motivo == ALERTA_SENSOR) {
    mostrarAlerta("Sensor com defeito");
  } else {
    mostrarAlerta("Falha na irrigacao");
  }
}

// Garante que o jato nunca passa do tempo
void controlarBomba(unsigned long agora) {

  if (estadoIrrigacao == REGANDO) {

    unsigned long decorrido = agora - inicioRega;

    if (decorrido >= duracaoRega || decorrido >= JATO_MAXIMO_MS) {
      finalizarRega();
    }

  } else if (digitalRead(PINO_RELE) == RELE_LIGADO) {
    // bomba ligada fora do estado REGANDO: nunca deveria acontecer
    bombaDesligar();
  }
}

// ============================================================
// SITE / API
// ============================================================

const char* tipoRegaTexto(uint8_t t) {
  return t == ORIGEM_MANUAL ? "manual" : "automatica";
}

String jsonEstado() {

  const Perfil& p = perfilAtual();

  const char* estadoTxt = "normal";
  if (estadoIrrigacao == REGANDO) estadoTxt = "regando";
  else if (estadoIrrigacao == AGUARDANDO) estadoTxt = "aguardando";
  else if (estadoIrrigacao == ALERTA) estadoTxt = "alerta";

  const char* motivoTxt = "";
  if (motivoAlerta == ALERTA_UMIDADE) motivoTxt = "umidade";
  else if (motivoAlerta == ALERTA_RESERVATORIO) motivoTxt = "reservatorio";
  else if (motivoAlerta == ALERTA_SENSOR) motivoTxt = "sensor";

  String s;
  s.reserve(1000);

  s += "{\"configurado\":";
  s += configurado ? "true" : "false";
  s += ",\"modo\":\"";
  s += modoAutomatico ? "automatica" : "manual";
  s += "\",\"tipo\":\"";
  s += p.nome;
  s += "\",\"umidadePct\":";
  s += umidadeAtual;
  s += ",\"umidade\":\"";
  s += nomeUmidade();
  s += "\",\"sensorOk\":";
  s += sensorOk ? "true" : "false";
  s += ",\"faixaMin\":";
  s += (p.seca + 1);
  s += ",\"faixaMax\":";
  s += p.encharcada;
  s += ",\"alvo\":";
  s += p.alvo;
  s += ",\"reservatorio\":";
  s += pctReservatorio();
  s += ",\"estado\":\"";
  s += estadoTxt;
  s += "\",\"motivoAlerta\":\"";
  s += motivoTxt;
  s += "\",\"rega\":";
  s += contadorRegas;
  s += ",\"maxRegas\":";
  s += MAX_REGAS;
  s += ",\"horaOk\":";
  s += horaValida() ? "true" : "false";
  s += ",\"historico\":[";

  for (int i = 0; i < numHistorico; i++) {
    if (i > 0) s += ",";
    s += "{\"t\":";
    s += historico[i].epoch;
    s += ",\"tipo\":\"";
    s += tipoRegaTexto(historico[i].tipo);
    s += "\",\"ml\":";
    s += historico[i].ml;
    s += "}";
  }

  s += "]}";
  return s;
}

void enviarJson(int codigo, const String& corpo) {
  server.sendHeader("Cache-Control", "no-store");
  server.send(codigo, "application/json", corpo);
}

void enviarErro(int codigo, const char* motivo, const char* mensagem) {
  String s = "{\"ok\":false,\"motivo\":\"";
  s += motivo;
  s += "\",\"mensagem\":\"";
  s += mensagem;
  s += "\"}";
  enviarJson(codigo, s);
}

// GET /api/estado
void apiEstado() {
  enviarJson(200, jsonEstado());
}

// POST /api/regar  -> "Regar agora"
void apiRegar() {

  if (estadoIrrigacao == REGANDO || estadoIrrigacao == AGUARDANDO) {
    enviarErro(409, "ocupada", "Já estou regando. Aguarde a água se espalhar!");
    return;
  }

  if (!sensorOk) {
    enviarErro(409, "sensor", "Não consegui ler a umidade. Confira o sensor!");
    return;
  }

  const Perfil& p = perfilAtual();

  if (umidadeAtual > p.encharcada) {
    enviarErro(409, "encharcada", "A terra já está encharcada. Vamos esperar secar!");
    return;
  }

  if (umidadeAtual >= p.alvo) {
    enviarErro(409, "umida", "A terra já está molhadinha. Não precisa regar agora!");
    return;
  }

  if (!reservatorioOk()) {
    enviarErro(409, "reservatorio", "O reservatório está vazio. Encha antes de regar!");
    return;
  }

  Serial.println("REGA MANUAL PEDIDA PELO APP");
  iniciarCiclo(ORIGEM_MANUAL);

  String s = "{\"ok\":true,\"mensagem\":\"Regando a planta!\"}";
  enviarJson(200, s);
}

// POST /api/config  (modo=automatica|manual  e/ou  tipo=cactos|...)
void apiConfig() {

  bool mudou = false;

  if (server.hasArg("modo")) {
    String m = server.arg("modo");

    if (m == "automatica") {
      modoAutomatico = true;
    } else if (m == "manual") {
      modoAutomatico = false;
    } else {
      enviarErro(400, "modo", "Modo inválido.");
      return;
    }
    mudou = true;
  }

  if (server.hasArg("tipo")) {
    String t = server.arg("tipo");
    int idx = -1;

    for (int i = 0; i < NUM_PERFIS; i++) {
      if (t == PERFIS[i].nome) idx = i;
    }

    if (idx < 0) {
      enviarErro(400, "tipo", "Tipo de planta inválido.");
      return;
    }

    tipoIdx = idx;
    mudou = true;
  }

  if (mudou) {
    configurado = true;
    salvarConfig();

    Serial.print("CONFIG: modo=");
    Serial.print(modoAutomatico ? "automatica" : "manual");
    Serial.print(" tipo=");
    Serial.println(perfilAtual().nome);
  }

  enviarJson(200, jsonEstado());
}

// POST /api/hora  (t = epoch em segundos, vem do celular)
void apiHora() {

  uint32_t t = (uint32_t)strtoul(server.arg("t").c_str(), nullptr, 10);

  if (t < 1700000000UL) {
    enviarErro(400, "hora", "Hora inválida.");
    return;
  }

  definirHora(t);
  enviarJson(200, jsonEstado());
}

// POST /api/reservatorio  (acao=encher)
void apiReservatorio() {

  if (server.arg("acao") != "encher") {
    enviarErro(400, "acao", "Ação inválida.");
    return;
  }

  reservatorioMl = RESERVATORIO_ML;
  salvarReservatorio();

  Serial.println("RESERVATORIO MARCADO COMO CHEIO");

  if (estadoIrrigacao == ALERTA && motivoAlerta == ALERTA_RESERVATORIO) {
    finalizarCiclo();
  }

  enviarJson(200, jsonEstado());
}

// Tipo de arquivo pela extensao
String tipoDeArquivo(const String& caminho) {
  if (caminho.endsWith(".html")) return "text/html; charset=utf-8";
  if (caminho.endsWith(".css")) return "text/css";
  if (caminho.endsWith(".js")) return "application/javascript";
  if (caminho.endsWith(".webp")) return "image/webp";
  if (caminho.endsWith(".png")) return "image/png";
  if (caminho.endsWith(".jpg") || caminho.endsWith(".jpeg")) return "image/jpeg";
  if (caminho.endsWith(".svg")) return "image/svg+xml";
  if (caminho.endsWith(".mp3")) return "audio/mpeg";
  if (caminho.endsWith(".json")) return "application/json";
  if (caminho.endsWith(".woff2")) return "font/woff2";
  if (caminho.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
}

// Serve os arquivos do site que estao no LittleFS
// (se existir "arquivo.ext.gz", envia ele comprimido)
void servirArquivo() {

  String caminho = server.uri();

  if (caminho == "/") {
    server.sendHeader("Location", "/HTML/index.html");
    server.send(302, "text/plain", "");
    return;
  }

  if (caminho == "/favicon.ico") {
    server.send(204);
    return;
  }

  if (caminho.indexOf("..") >= 0 || caminho.startsWith("/api/")) {
    server.send(404, "text/plain", "Nao encontrado");
    return;
  }

  String tipo = tipoDeArquivo(caminho);
  String real = caminho;

  if (LittleFS.exists(caminho + ".gz")) {
    real = caminho + ".gz";
  } else if (!LittleFS.exists(caminho)) {
    server.send(404, "text/plain", "Nao encontrado");
    return;
  }

  fs::File arquivo = LittleFS.open(real, "r");

  if (!arquivo || arquivo.isDirectory()) {
    server.send(404, "text/plain", "Nao encontrado");
    return;
  }

  bool pesado = caminho.endsWith(".webp") || caminho.endsWith(".mp3");
  server.sendHeader("Cache-Control",
                    pesado ? "public, max-age=86400" : "no-cache");

  server.streamFile(arquivo, tipo);
  arquivo.close();
}

void iniciarWifi() {

  bool usarCasa = (WIFI_STA_SSID[0] != '\0');

  WiFi.mode(usarCasa ? WIFI_AP_STA : WIFI_AP);
  WiFi.softAP(WIFI_AP_SSID, WIFI_AP_SENHA);

  Serial.print("Wi-Fi do ESP: ");
  Serial.print(WIFI_AP_SSID);
  Serial.print("  IP: ");
  Serial.println(WiFi.softAPIP());

  if (usarCasa) {
    WiFi.begin(WIFI_STA_SSID, WIFI_STA_SENHA);

    unsigned long inicio = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - inicio < 8000) {
      delay(200);
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("Conectado na rede de casa. IP: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println("Nao conectou na rede de casa (segue so com o AP).");
    }
  }

  if (MDNS.begin("plantamigo")) {
    Serial.println("Tambem em: http://plantamigo.local");
  }
}

void iniciarServidor() {

  server.on("/api/estado", HTTP_GET, apiEstado);
  server.on("/api/regar", HTTP_POST, apiRegar);
  server.on("/api/config", HTTP_POST, apiConfig);
  server.on("/api/hora", HTTP_POST, apiHora);
  server.on("/api/reservatorio", HTTP_POST, apiReservatorio);

  server.onNotFound(servirArquivo);

  server.begin();
}

// ============================================================
// SETUP
// ============================================================

void setup() {

  Serial.begin(115200);

  // RELE DESLIGADO NA INICIALIZACAO (primeiro o modo, depois o nivel)
  pinMode(PINO_RELE, OUTPUT);
  bombaDesligar();

  pinMode(PINO_SENSOR, INPUT);

  carregarMemoria();

  tft.init();
  tft.setRotation(1);
  tft.fillScreen(FUNDO);

  bool fsOk = LittleFS.begin(false);

  if (!fsOk) {
    Serial.println("ERRO: LittleFS nao montou. Envie a pasta data/ para o ESP.");
    tft.setTextColor(BRANCO, FUNDO);
    tft.setTextSize(2);
    tft.setCursor(10, 100);
    tft.print("Site nao enviado!");
    tft.setCursor(10, 130);
    tft.print("Envie a pasta data");
    delay(3000);
  }

  iniciarWifi();
  iniciarServidor();

  mostrarTelaConexao(WiFi.softAPIP().toString());
  delay(4000);

  tft.fillScreen(FUNDO);

  umidadeAtual = lerUmidade();
  estadoAtual = definirEstado(umidadeAtual);

  atualizarExpressao();
  mostrarUmidade(umidadeAtual);

  ultimaLeitura = millis();
  ultimoPiscar = millis();
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

void loop() {

  server.handleClient();

  unsigned long agora = millis();

  // CONTROLE DO TEMPO DO JATO
  controlarBomba(agora);

  // ANIMACAO DA BATERIA
  if (estadoIrrigacao == REGANDO ||
      estadoIrrigacao == AGUARDANDO) {

    if (agora - ultimaAnimacao >= 500) {
      ultimaAnimacao = agora;
      desenharBateria();
    }
  }

  // LEITURA A CADA 1 SEGUNDO
  if (agora - ultimaLeitura >= INTERVALO_LEITURA) {

    ultimaLeitura = agora;
    int leitura = lerUmidade();

    if (sensorOk) {
      umidadeAtual = leitura;
    }

    Serial.print("Umidade: ");
    Serial.print(umidadeAtual);
    Serial.println(sensorOk ? "%" : "% (SENSOR COM PROBLEMA)");

    // sensor falhou no meio de um ciclo: para tudo
    if (!sensorOk &&
        (estadoIrrigacao == REGANDO || estadoIrrigacao == AGUARDANDO)) {

      entrarAlerta(ALERTA_SENSOR);
    }

    // MODO NORMAL
    else if (estadoIrrigacao == NORMAL) {

      if (sensorOk) {

        int novoEstado = definirEstado(umidadeAtual);

        if (novoEstado != estadoAtual) {
          estadoAtual = novoEstado;
          atualizarExpressao();
        }

        mostrarUmidade(umidadeAtual);

        // IRRIGACAO AUTOMATICA (so se o modo for automatico)
        if (modoAutomatico && umidadeAtual <= perfilAtual().seca) {

          if (reservatorioOk()) {
            Serial.println("REGA AUTOMATICA");
            iniciarCiclo(ORIGEM_AUTO);
          } else {
            entrarAlerta(ALERTA_RESERVATORIO);
          }
        }
      }
    }

    // ALERTA
    else if (estadoIrrigacao == ALERTA) {

      if (motivoAlerta == ALERTA_SENSOR) {

        if (sensorOk) finalizarCiclo();

      } else if (sensorOk && umidadeAtual >= perfilAtual().alvo) {

        finalizarCiclo();
      }
    }
  }

  // FIM DA ESPERA DE 2 MINUTOS
  if (estadoIrrigacao == AGUARDANDO &&
      agora - inicioEspera >= TEMPO_ESPERA) {

    int leitura = lerUmidade();

    if (!sensorOk) {

      entrarAlerta(ALERTA_SENSOR);

    } else {

      umidadeAtual = leitura;

      Serial.print("VERIFICACAO APOS 2 MIN: ");
      Serial.print(umidadeAtual);
      Serial.println("%");

      const Perfil& p = perfilAtual();

      if (umidadeAtual >= p.alvo) {

        finalizarCiclo();

      } else if (contadorRegas >= MAX_REGAS) {

        Serial.println("LIMITE DE 3 REGAS ATINGIDO");
        entrarAlerta(ALERTA_UMIDADE);

      } else if (!reservatorioOk()) {

        Serial.println("RESERVATORIO VAZIO");
        entrarAlerta(ALERTA_RESERVATORIO);

      } else if (umidadeAtual >= p.alvo - 10) {

        iniciarRega(p.jatoCurtoMs);

      } else {

        iniciarRega(p.jatoMs);
      }
    }
  }

  // ANIMACAO DOS OLHOS SOMENTE NO MODO NORMAL
  if (estadoIrrigacao == NORMAL) {

    if (!olhosFechados &&
        agora - ultimoPiscar >= 4000) {

      olhosFechados = true;
      inicioPiscar = agora;

      atualizarOlhos(true);
    }

    if (olhosFechados &&
        agora - inicioPiscar >= 180) {

      olhosFechados = false;
      ultimoPiscar = agora;

      atualizarOlhos(false);
    }
  }
}
