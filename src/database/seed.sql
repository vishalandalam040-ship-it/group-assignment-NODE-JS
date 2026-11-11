INSERT OR IGNORE INTO designers (id, name, email) VALUES
  (1, 'Ava Reynolds', 'ava.reynolds@printpoint.com'),
  (2, 'Leo Martins', 'leo.martins@printpoint.com'),
  (3, 'Mila Chen', 'mila.chen@printpoint.com');

INSERT OR IGNORE INTO printers (id, name, material, status) VALUES
  (101, 'Prusa MK4', 'PLA', 'available'),
  (102, 'Creality CR-10', 'ABS', 'printing'),
  (103, 'Anycubic Kobra', 'PETG', 'maintenance'),
  (104, 'Bambu Lab X1', 'PLA', 'available');

INSERT OR IGNORE INTO reservations (id, designer_id, printer_id, reservation_date, status) VALUES
  (1, 1, 101, '2026-11-10', 'confirmed'),
  (2, 2, 102, '2026-11-12', 'pending'),
  (3, 3, 104, '2026-11-13', 'completed');
