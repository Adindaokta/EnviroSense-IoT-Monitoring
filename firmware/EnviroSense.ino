
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include "DHT.h"

// Konfigurasi DHT22
#define DHTPIN 15
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Konfigurasi pin sensor
const int ldrPin = 34;
const int moisturePin = 35;

// Konfigurasi LED
const int redLED = 26;
const int greenLED = 27;

// WiFi Wokwi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Alamat backend Flask melalui Cloudflare
const char* serverName =
"https://solid-cornell-substantially-boating.trycloudflare.com/api/sensor-data";

void connectWiFi() {
  Serial.print("Menghubungkan ke WiFi");

  WiFi.begin(ssid, password, 6);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi berhasil terhubung!");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);

  dht.begin();

  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);

  analogReadResolution(12);

  connectWiFi();
}

void loop() {
  // Membaca sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  int light = analogRead(ldrPin);
  int moisture = analogRead(moisturePin);

  // Periksa pembacaan DHT22
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Gagal membaca sensor DHT22!");
    delay(5000);
    return;
  }

  // Indikator kondisi lingkungan
  if (temperature >= 35 || humidity >= 80) {
    digitalWrite(redLED, HIGH);
    digitalWrite(greenLED, LOW);
  } else {
    digitalWrite(redLED, LOW);
    digitalWrite(greenLED, HIGH);
  }

  // Tampilkan data sensor
  Serial.println("\n===== DATA SENSOR =====");
  Serial.print("Suhu       : ");
  Serial.print(temperature);
  Serial.println(" C");

  Serial.print("Kelembapan : ");
  Serial.print(humidity);
  Serial.println(" %");

  Serial.print("Cahaya     : ");
  Serial.println(light);

  Serial.print("Moisture   : ");
  Serial.println(moisture);

  // Kirim data ke backend
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Hanya untuk pengujian

    HTTPClient http;

    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000);

    String jsonData = "{";
    jsonData += "\"temperature\":" + String(temperature, 2) + ",";
    jsonData += "\"humidity\":" + String(humidity, 2) + ",";
    jsonData += "\"light\":" + String(light) + ",";
    jsonData += "\"moisture\":" + String(moisture);
    jsonData += "}";

    Serial.println("\nMengirim data ke server...");
    Serial.println(jsonData);

    int responseCode = http.POST(jsonData);

    Serial.print("HTTP Response Code: ");
    Serial.println(responseCode);

    if (responseCode == 201) {
      Serial.println("Data berhasil disimpan ke database!");
    } else {
      Serial.println("Pengiriman data gagal!");
      if (responseCode > 0) {
        Serial.println(http.getString());
      }
    }

    http.end();
  } else {
    Serial.println("WiFi terputus!");
    connectWiFi();
  }

  delay(5000);
}
