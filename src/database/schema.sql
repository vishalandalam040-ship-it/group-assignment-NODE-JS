CREATE TABLE IF NOT EXISTS designers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS printers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  material TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'printing', 'maintenance'))
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  designer_id INTEGER NOT NULL,
  printer_id INTEGER NOT NULL,
  reservation_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  FOREIGN KEY (designer_id) REFERENCES designers(id),
  FOREIGN KEY (printer_id) REFERENCES printers(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL CHECK (action IN ('ADD', 'UPDATE', 'DELETE')),
  printer_id INTEGER NOT NULL,
  time TEXT NOT NULL
);
