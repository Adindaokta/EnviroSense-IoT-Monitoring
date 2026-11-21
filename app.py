from flask import Flask, request, jsonify, render_template
import sqlite3
import csv
import io
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "database.db"


def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sensor_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                temperature REAL,
                humidity REAL,
                light INTEGER,
                moisture INTEGER,
                timestamp TEXT
            )
        """)


@app.route("/")
def dashboard():
    return render_template("index.html")


@app.route("/api/sensor-data", methods=["POST"])
def receive_data():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"status": "error", "message": "Data JSON tidak ditemukan"}), 400

    required = ["temperature", "humidity", "light", "moisture"]
    if not all(key in data for key in required):
        return jsonify({"status": "error", "message": "Data sensor tidak lengkap"}), 400

    try:
        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        light = int(data["light"])
        moisture = int(data["moisture"])
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "Format data tidak valid"}), 400

    timestamp = datetime.now().isoformat(timespec="seconds")

    with get_connection() as conn:
        conn.execute("""
            INSERT INTO sensor_data
            (temperature, humidity, light, moisture, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (temperature, humidity, light, moisture, timestamp))

    print("Data sensor berhasil disimpan!")
    return jsonify({
        "status": "success",
        "message": "Data berhasil disimpan",
        "received_at": timestamp
    }), 201


@app.route("/api/latest", methods=["GET"])
def get_latest():
    with get_connection() as conn:
        row = conn.execute("""
            SELECT * FROM sensor_data
            ORDER BY id DESC LIMIT 1
        """).fetchone()

    if row is None:
        return jsonify({"message": "Belum ada data sensor"}), 404

    return jsonify(dict(row))


@app.route("/api/history", methods=["GET"])
def get_history():
    try:
        limit = int(request.args.get("limit", 100))
        limit = max(1, min(limit, 500))
    except ValueError:
        limit = 100

    with get_connection() as conn:
        rows = conn.execute("""
            SELECT * FROM sensor_data
            ORDER BY id DESC LIMIT ?
        """, (limit,)).fetchall()

    return jsonify([dict(row) for row in rows])


@app.route("/api/export.csv", methods=["GET"])
def export_csv():
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT id, temperature, humidity, light, moisture, timestamp
            FROM sensor_data
            ORDER BY id DESC
        """).fetchall()

    output = io.StringIO()
    output.write("\\ufeff")  # BOM agar mudah dibuka di Microsoft Excel
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Suhu (C)", "Kelembapan Udara (%)",
        "Intensitas Cahaya (ADC)", "Simulasi Kelembapan Tanah (ADC)",
        "Waktu Pencatatan"
    ])

    for row in rows:
        writer.writerow([
            row["id"], row["temperature"], row["humidity"],
            row["light"], row["moisture"], row["timestamp"]
        ])

    response = app.response_class(
        output.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=riwayat_sensor.csv"}
    )
    return response


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
