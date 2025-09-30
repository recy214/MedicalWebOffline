const db = new Dexie('MedicalDB_v2');

db.version(1).stores({
  usuarios: '++id, &matricula, rol',
  pacientes: '++id, &matricula',
  historialClinico: '++id, pacienteId, fecha, estadoSinc',
  registrosES: '++id, [usuarioId+fecha], tipo, estadoSinc',
  mesasOperacion: '++id, numero, estado'
});

db.on('populate', async () => {
    await db.usuarios.add({
        id: 'admin',
        nombre: 'Administrador',
        apellidos: '',
        matricula: 'admin',
        contrasena: 'admin123',
        rol: 'admin'
    });
});

db.open().catch(err => {
    console.error('Failed to open db: ' + (err.stack || err));
});