// Archivo: main.js
//
// Funcionalidades implementadas:
// Issue #1: Votación única por usuario - Sistema de autenticación con nombres de votantes
// Issue #2: Mostrar porcentajes junto con resultados - Cálculo automático de porcentajes de votos
// Issue #3: Seleccionar una elección activa - Lista de elecciones disponibles para seleccionar
// Issue #4: Cierre manual de elecciones - Funcionalidad para cerrar elecciones y bloquear votos
// Issue #5: Ganador de elecciones - Determinación automática de ganador o empate

const readline = require('readline');

let elecciones = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const menuActions = {
  '1': crearEleccion,
  '2': agregarCandidatos,
  '3': emitirVoto,
  '4': verResultados,
  '5': cerrarEleccion,
  '6': () => rl.close()
};

function mainMenu() {
  console.log(`
📋 Simulador de Votación
1. Crear nueva elección
2. Agregar candidatos
3. Emitir voto
4. Ver resultados
5. Cerrar elección
6. Salir
`);
  rl.question("Seleccione una opción: ", (option) => {
    const action = menuActions[option];
    if (action) {
      action();
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

  const listaElecciones = eleccionesFiltradas.map((e, i) => {
    const estado = e.cerrada ? "(CERRADA)" : "(ABIERTA)";
    return `${i + 1}. ${e.nombre} ${estado}`;
  }).join('\n');
  console.log(`\nSeleccione una elección:\n${listaElecciones}`);

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

      const listaCandidatos = eleccion.candidatos.map((c, i) => `${i + 1}. ${c.nombre}`).join('\n');
      console.log(`\nElección: ${eleccion.nombre}\n${listaCandidatos}`);

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

    const resultadosCandidatos = eleccion.candidatos.map(c => {
      if (totalVotos === 0) {
        return `- ${c.nombre}: ${c.votos} voto(s)`;
      } else {
        const porcentaje = ((c.votos / totalVotos) * 100).toFixed(1);
        return `- ${c.nombre}: ${c.votos} voto(s) (${porcentaje}%)`;
      }
    }).join('\n');
    console.log(resultadosCandidatos);

    // Issue 5: Ganador de elecciones
    console.log(determinarGanador(eleccion));

    mainMenu();
  });
}

function determinarGanador(eleccion) {
  if (eleccion.candidatos.length === 0) {
    return "\nNo hay candidatos en esta elección.";
  }
  
  const maxVotos = Math.max(...eleccion.candidatos.map(c => c.votos));
  
  if (maxVotos === 0) {
    return "\nAún no se han emitido votos.";
  }
  
  const ganadores = eleccion.candidatos.filter(c => c.votos === maxVotos);
  
  if (ganadores.length === 1) {
    return `\nGanador: ${ganadores[0].nombre} con ${maxVotos} voto(s)`;
  }
  
  const nombresGanadores = ganadores.map(g => g.nombre).join(', ');
  return `\nEmpate entre: ${nombresGanadores} con ${maxVotos} voto(s) cada uno`;
}

mainMenu();
