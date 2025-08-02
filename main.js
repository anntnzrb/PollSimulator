// Archivo: main.js

const readline = require('readline');

let elecciones = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function mainMenu() {
  console.log("\n📋 Simulador de Votación");
  console.log("1. Crear nueva elección");
  console.log("2. Agregar candidatos");
  console.log("3. Emitir voto");
  console.log("4. Ver resultados");
  console.log("5. Cerrar elección");
  console.log("6. Salir\n");
  rl.question("Seleccione una opción: ", (option) => {
    if (option === '1') {
      crearEleccion();
    } else if (option === '2') {
      agregarCandidatos();
    } else if (option === '3') {
      emitirVoto();
    } else if (option === '4') {
      verResultados();
    } else if (option === '5') {
      cerrarEleccion();
    } else if (option === '6') {
      rl.close();
    } else {
      console.log("Opción inválida.");
      mainMenu();
    }
  });
}

function crearEleccion() {
  rl.question("Nombre de la elección: ", (nombre) => {
    elecciones.push({
      nombre: nombre,
      candidatos: [],
      cerrada: false,
      votantes: []
    });
    console.log(`Elección "${nombre}" creada.`);
    mainMenu();
  });
}

function seleccionarEleccion(callback, filtrarAbiertas = false) {
  if (elecciones.length === 0) {
    console.log("No hay elecciones creadas.");
    mainMenu();
    return;
  }

  const eleccionesFiltradas = filtrarAbiertas
    ? elecciones.filter(e => !e.cerrada)
    : elecciones;

  if (eleccionesFiltradas.length === 0) {
    console.log("No hay elecciones disponibles.");
    mainMenu();
    return;
  }

  if (eleccionesFiltradas.length === 1) {
    callback(eleccionesFiltradas[0]);
    return;
  }

  console.log("\nSeleccione una elección:");
  eleccionesFiltradas.forEach((e, i) => {
    const estado = e.cerrada ? "(CERRADA)" : "(ABIERTA)";
    console.log(`${i + 1}. ${e.nombre} ${estado}`);
  });

  rl.question("Número de elección: ", (num) => {
    const idx = parseInt(num) - 1;
    if (idx >= 0 && idx < eleccionesFiltradas.length) {
      callback(eleccionesFiltradas[idx]);
    } else {
      console.log("Elección inválida.");
      mainMenu();
    }
  });
}

function agregarCandidatos() {
  seleccionarEleccion((eleccion) => {
    if (eleccion.cerrada) {
      console.log(`La elección "${eleccion.nombre}" está cerrada.`);
      mainMenu();
      return;
    }

    rl.question("Nombre del candidato: ", (nombreCandidato) => {
      eleccion.candidatos.push({ nombre: nombreCandidato, votos: 0 });
      console.log(`Candidato "${nombreCandidato}" agregado a "${eleccion.nombre}".`);
      mainMenu();
    });
  });
}

function emitirVoto() {
  seleccionarEleccion((eleccion) => {
    if (eleccion.cerrada) {
      console.log(`La elección "${eleccion.nombre}" está cerrada. No se pueden emitir más votos.`);
      mainMenu();
      return;
    }

    if (eleccion.candidatos.length === 0) {
      console.log("No hay candidatos en esta elección.");
      mainMenu();
      return;
    }

    rl.question("Ingrese su nombre: ", (nombreVotante) => {
      if (!nombreVotante.trim()) {
        console.log("Debe ingresar un nombre válido.");
        mainMenu();
        return;
      }

      // check si el votante ya votó
      if (eleccion.votantes.includes(nombreVotante.trim())) {
        console.log(`${nombreVotante} ya ha votado en esta elección.`);
        mainMenu();
        return;
      }

      console.log(`\nElección: ${eleccion.nombre}`);
      eleccion.candidatos.forEach((c, i) => {
        console.log(`${i + 1}. ${c.nombre}`);
      });

      rl.question("Seleccione el número del candidato: ", (num) => {
        const idx = parseInt(num) - 1;
        if (idx >= 0 && idx < eleccion.candidatos.length) {
          eleccion.candidatos[idx].votos++;
          eleccion.votantes.push(nombreVotante.trim());
          console.log(`Voto registrado para ${eleccion.candidatos[idx].nombre}`);
        } else {
          console.log("Candidato inválido.");
        }
        mainMenu();
      });
    });
  }, true); // filtrarAbiertas = true
}

function cerrarEleccion() {
  seleccionarEleccion((eleccion) => {
    if (eleccion.cerrada) {
      console.log(`La elección "${eleccion.nombre}" ya está cerrada.`);
      mainMenu();
      return;
    }

    eleccion.cerrada = true;
    console.log(`Elección "${eleccion.nombre}" cerrada. No se aceptarán más votos.`);
    mainMenu();
  });
}

function verResultados() {
  seleccionarEleccion((eleccion) => {
    const estado = eleccion.cerrada ? "CERRADA" : "ABIERTA";
    console.log(`\nResultados para "${eleccion.nombre}" (${estado}):`);

    const totalVotos = eleccion.candidatos.reduce((sum, c) => sum + c.votos, 0);

    if (totalVotos > 0) {
      console.log(`\nTotal de votos emitidos: ${totalVotos}`);
    }

    eleccion.candidatos.forEach(c => {
      if (totalVotos === 0) {
        console.log(`- ${c.nombre}: ${c.votos} voto(s)`);
      } else {
        const porcentaje = ((c.votos / totalVotos) * 100).toFixed(1);
        console.log(`- ${c.nombre}: ${c.votos} voto(s) (${porcentaje}%)`);
      }
    });

    // Issue 5: Ganador de elecciones
    if (eleccion.candidatos.length === 0) {
      console.log("\nNo hay candidatos en esta elección.");
    } else {
      const maxVotos = Math.max(...eleccion.candidatos.map(c => c.votos));
      const ganadores = eleccion.candidatos.filter(c => c.votos === maxVotos);

      if (maxVotos === 0) {
        console.log("\nAún no se han emitido votos.");
      } else if (ganadores.length === 1) {
        console.log(`\nGanador: ${ganadores[0].nombre} con ${maxVotos} voto(s)`);
      } else {
        const nombresGanadores = ganadores.map(g => g.nombre).join(', ');
        console.log(`\nEmpate entre: ${nombresGanadores} con ${maxVotos} voto(s) cada uno`);
      }
    }

    mainMenu();
  });
}

mainMenu();
