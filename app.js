// ===== VARIABLES GLOBALES =====
let socios = JSON.parse(localStorage.getItem('socios')) || [];
let movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];

// CUOTA FIJA
const CUOTA_FIJA = 10;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    inicializarEventos();
    actualizarTodo();
});

function inicializarEventos() {
    // Navegación
    document.querySelectorAll('.btn-menu').forEach(btn => {
        btn.addEventListener('click', cambiarSeccion);
    });

    // Socios
    document.getElementById('btnNuevoSocio').addEventListener('click', mostrarFormularioSocio);
    document.getElementById('btnCancelarSocio').addEventListener('click', ocultarFormularioSocio);
    document.getElementById('formSocio').addEventListener('submit', guardarSocio);

    // Movimientos
    document.getElementById('btnNuevaEntrada').addEventListener('click', mostrarFormularioEntrada);
    document.getElementById('btnCancelarEntrada').addEventListener('click', ocultarFormularioEntrada);
    document.getElementById('formMovEntrada').addEventListener('submit', guardarEntrada);

    document.getElementById('btnNuevaSalida').addEventListener('click', mostrarFormularioSalida);
    document.getElementById('btnCancelarSalida').addEventListener('click', ocultarFormularioSalida);
    document.getElementById('formMovSalida').addEventListener('submit', guardarSalida);

    document.getElementById('btnAjusteBalance').addEventListener('click', mostrarFormularioAjuste);
    document.getElementById('btnCancelarAjuste').addEventListener('click', ocultarFormularioAjuste);
    document.getElementById('formMovAjuste').addEventListener('submit', guardarAjuste);

    // Morosos
    document.getElementById('btnCopiarMorosos').addEventListener('click', copiarMorosos);

    // Cuenta por Socio
    document.getElementById('selectSocio').addEventListener('change', mostrarCuentaSocio);
}

// ===== NAVEGACIÓN =====
function cambiarSeccion(e) {
    const menuActivo = document.querySelector('.btn-menu.active');
    menuActivo.classList.remove('active');
    e.target.classList.add('active');

    const seccionActiva = document.querySelector('.section.active');
    seccionActiva.classList.remove('active');

    const nuevaSeccion = document.getElementById(e.target.dataset.menu);
    nuevaSeccion.classList.add('active');

    // Actualizar selects si es necesario
    if (e.target.dataset.menu === 'movimientos') {
        actualizarSelectSocios('socioEntrada');
    }
    if (e.target.dataset.menu === 'cuenta-socio') {
        actualizarSelectSociosCuenta();
    }
}

// ===== SOCIOS =====
function mostrarFormularioSocio() {
    document.getElementById('formNuevoSocio').classList.remove('hidden');
    document.getElementById('nombreSocio').focus();
}

function ocultarFormularioSocio() {
    document.getElementById('formNuevoSocio').classList.add('hidden');
    document.getElementById('formSocio').reset();
}

function guardarSocio(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreSocio').value.trim();
    const email = document.getElementById('emailSocio').value.trim();
    const telefono = document.getElementById('telefonoSocio').value.trim();

    if (!nombre) {
        alert('Por favor, ingresa el nombre del socio');
        return;
    }

    const nuevoSocio = {
        id: Date.now(),
        nombre: nombre,
        email: email,
        telefono: telefono,
        activo: true,
        fechaAlta: new Date().toISOString()
    };

    socios.push(nuevoSocio);
    guardarDatos();
    actualizarTodo();
    ocultarFormularioSocio();
}

function eliminarSocio(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este socio?')) {
        socios = socios.map(s => s.id === id ? { ...s, activo: false } : s);
        guardarDatos();
        actualizarTodo();
    }
}

function restaurarSocio(id) {
    socios = socios.map(s => s.id === id ? { ...s, activo: true } : s);
    guardarDatos();
    actualizarTodo();
}

function actualizarTablaSocios() {
    const tabla = document.getElementById('tablaSocios');
    tabla.innerHTML = '';

    if (socios.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px;">No hay socios registrados</td></tr>';
        return;
    }

    socios.forEach(socio => {
        const fila = document.createElement('tr');
        const estadoClass = socio.activo ? 'badge-active' : 'badge-inactivo';
        const estadoText = socio.activo ? 'Activo' : 'Inactivo';
        
        fila.innerHTML = `
            <td><strong>${socio.nombre}</strong></td>
            <td>${socio.email || '-'}</td>
            <td>${socio.telefono || '-'}</td>
            <td><span class="badge ${estadoClass}">${estadoText}</span></td>
            <td>
                ${socio.activo 
                    ? `<button class="btn-danger" onclick="eliminarSocio(${socio.id})">Dar de Baja</button>`
                    : `<button class="btn-primary" style="padding: 8px 16px; font-size: 0.9em;" onclick="restaurarSocio(${socio.id})">Dar de Alta</button>`
                }
            </td>
        `;
        tabla.appendChild(fila);
    });
}

// ===== MOVIMIENTOS =====
function mostrarFormularioEntrada() {
    document.getElementById('formEntrada').classList.remove('hidden');
    actualizarSelectSocios('socioEntrada');
    // Prellenar la cantidad con la cuota fija
    document.getElementById('cantidadEntrada').value = CUOTA_FIJA;
    document.getElementById('socioEntrada').focus();
}

function ocultarFormularioEntrada() {
    document.getElementById('formEntrada').classList.add('hidden');
    document.getElementById('formMovEntrada').reset();
}

function mostrarFormularioSalida() {
    document.getElementById('formSalida').classList.remove('hidden');
    document.getElementById('descripcionSalida').focus();
}

function ocultarFormularioSalida() {
    document.getElementById('formSalida').classList.add('hidden');
    document.getElementById('formMovSalida').reset();
}

function mostrarFormularioAjuste() {
    document.getElementById('formAjuste').classList.remove('hidden');
    document.getElementById('cantidadAjuste').focus();
    document.getElementById('fechaAjuste').valueAsDate = new Date();
}

function ocultarFormularioAjuste() {
    document.getElementById('formAjuste').classList.add('hidden');
    document.getElementById('formMovAjuste').reset();
}

function actualizarSelectSocios(selectId) {
    const select = document.getElementById(selectId);
    const sociosActivos = socios.filter(s => s.activo);
    
    select.innerHTML = '<option value="">Selecciona un socio</option>';
    sociosActivos.forEach(socio => {
        const option = document.createElement('option');
        option.value = socio.id;
        option.textContent = socio.nombre;
        select.appendChild(option);
    });
}

function guardarEntrada(e) {
    e.preventDefault();
    
    const socioId = parseInt(document.getElementById('socioEntrada').value);
    const cantidad = parseFloat(document.getElementById('cantidadEntrada').value);
    const mes = document.getElementById('mesEntrada').value;
    const notas = document.getElementById('notasEntrada').value.trim();

    if (!socioId || !cantidad || !mes) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }

    const nuevoMovimiento = {
        id: Date.now(),
        tipo: 'entrada',
        socioId: socioId,
        cantidad: cantidad,
        mes: mes,
        fecha: new Date().toISOString().split('T')[0],
        notas: notas
    };

    movimientos.push(nuevoMovimiento);
    guardarDatos();
    actualizarTodo();
    ocultarFormularioEntrada();
}

function guardarSalida(e) {
    e.preventDefault();
    
    const descripcion = document.getElementById('descripcionSalida').value.trim();
    const cantidad = parseFloat(document.getElementById('cantidadSalida').value);
    const fecha = document.getElementById('fechaSalida').value;
    const notas = document.getElementById('notasSalida').value.trim();

    if (!descripcion || !cantidad || !fecha) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }

    const nuevoMovimiento = {
        id: Date.now(),
        tipo: 'salida',
        descripcion: descripcion,
        cantidad: cantidad,
        fecha: fecha,
        notas: notas
    };

    movimientos.push(nuevoMovimiento);
    guardarDatos();
    actualizarTodo();
    ocultarFormularioSalida();
}

function guardarAjuste(e) {
    e.preventDefault();
    
    const cantidad = parseFloat(document.getElementById('cantidadAjuste').value);
    const fecha = document.getElementById('fechaAjuste').value;
    const notas = document.getElementById('notasAjuste').value.trim() || 'Ajuste de balance inicial';

    if (!cantidad || !fecha) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }

    const nuevoMovimiento = {
        id: Date.now(),
        tipo: 'ajuste',
        descripcion: 'Ajuste de Balance',
        cantidad: cantidad,
        fecha: fecha,
        notas: notas
    };

    movimientos.push(nuevoMovimiento);
    guardarDatos();
    actualizarTodo();
    ocultarFormularioAjuste();
    alert('✅ Ajuste de balance registrado correctamente');
}

function eliminarMovimiento(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
        movimientos = movimientos.filter(m => m.id !== id);
        guardarDatos();
        actualizarTodo();
    }
}

function actualizarTablaMovimientos() {
    const tabla = document.getElementById('tablaMovimientos');
    tabla.innerHTML = '';

    if (movimientos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px;">No hay movimientos registrados</td></tr>';
        return;
    }

    const movOrdenados = [...movimientos].sort((a, b) => new Date(b.fecha || b.mes) - new Date(a.fecha || a.mes));

    movOrdenados.forEach(mov => {
        const fila = document.createElement('tr');
        let fecha = mov.fecha || mov.mes;
        let socioDescripcion = '';
        let cantidad = mov.cantidad;
        let badge = '';
        
        if (mov.tipo === 'entrada') {
            const socio = socios.find(s => s.id === mov.socioId);
            socioDescripcion = socio ? socio.nombre : 'Socio eliminado';
            badge = '<span class="badge badge-entrada">📥 Entrada</span>';
        } else if (mov.tipo === 'salida') {
            socioDescripcion = mov.descripcion;
            badge = '<span class="badge badge-salida">📤 Salida</span>';
        } else if (mov.tipo === 'ajuste') {
            socioDescripcion = mov.descripcion;
            badge = '<span class="badge" style="background-color: #fcd34d; color: #78350f;">⚙️ Ajuste</span>';
        }

        fila.innerHTML = `
            <td>${fecha}</td>
            <td>${badge}</td>
            <td>${socioDescripcion}</td>
            <td style="font-weight: 700; color: ${mov.tipo === 'salida' ? '#dc2626' : '#16a34a'}">
                ${mov.tipo === 'salida' ? '-' : '+'}€${cantidad.toFixed(2)}
            </td>
            <td>
                <button class="btn-danger" onclick="eliminarMovimiento(${mov.id})">Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

// ===== DASHBOARD =====
function actualizarDashboard() {
    const totalEntradas = movimientos
        .filter(m => m.tipo === 'entrada' || m.tipo === 'ajuste')
        .reduce((sum, m) => sum + m.cantidad, 0);

    const totalSalidas = movimientos
        .filter(m => m.tipo === 'salida')
        .reduce((sum, m) => sum + m.cantidad, 0);

    const balance = totalEntradas - totalSalidas;

    document.getElementById('totalEntradas').textContent = `€${totalEntradas.toFixed(2)}`;
    document.getElementById('totalSalidas').textContent = `€${totalSalidas.toFixed(2)}`;
    document.getElementById('balance').textContent = `€${balance.toFixed(2)}`;
    document.getElementById('totalSocios').textContent = socios.filter(s => s.activo).length;
}

// ===== MOROSOS =====
function actualizarMorosos() {
    const container = document.getElementById('listaMorosos');
    container.innerHTML = '';

    // Obtener meses con cuota (los primeros que aparezcan en entradas)
    const mesesCuota = new Set();
    movimientos.filter(m => m.tipo === 'entrada').forEach(m => {
        mesesCuota.add(m.mes);
    });

    if (mesesCuota.size === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 30px; color: #64748b;">No hay cuotas registradas</p>';
        return;
    }

    const mesesOrdenados = Array.from(mesesCuota).sort();
    const sociosActivos = socios.filter(s => s.activo);

    const morosos = [];

    sociosActivos.forEach(socio => {
        const deudaPorMes = {};
        let totalDeuda = 0;

        mesesOrdenados.forEach(mes => {
            const pagado = movimientos
                .filter(m => m.tipo === 'entrada' && m.socioId === socio.id && m.mes === mes)
                .reduce((sum, m) => sum + m.cantidad, 0);

            const debido = CUOTA_FIJA;
            const deuda = Math.max(0, debido - pagado);

            if (deuda > 0) {
                deudaPorMes[mes] = deuda;
                totalDeuda += deuda;
            }
        });

        if (totalDeuda > 0) {
            morosos.push({
                socio: socio,
                deudaPorMes: deudaPorMes,
                totalDeuda: totalDeuda
            });
        }
    });

    if (morosos.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 30px; color: #16a34a; font-weight: 600;">✅ ¡No hay morosos! Todos los socios están al día.</p>';
        return;
    }

    morosos.forEach(item => {
        const div = document.createElement('div');
        div.className = 'moroso-item';

        let detallesHtml = '<div class="moroso-detalles">';
        Object.keys(item.deudaPorMes).forEach(mes => {
            detallesHtml += `<div>📅 ${mes}: €${item.deudaPorMes[mes].toFixed(2)}</div>`;
        });
        detallesHtml += '</div>';

        div.innerHTML = `
            <div>
                <div class="moroso-nombre">👤 ${item.socio.nombre}</div>
                ${detallesHtml}
            </div>
            <div class="moroso-deuda">
                <div class="moroso-total">€${item.totalDeuda.toFixed(2)}</div>
                <div style="font-size: 0.85em; color: #64748b;">Total adeudado</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function copiarMorosos() {
    const container = document.getElementById('listaMorosos');
    let texto = '📊 INFORME DE MOROSOS\n';
    texto += '='.repeat(50) + '\n\n';

    const items = container.querySelectorAll('.moroso-item');
    
    if (items.length === 0) {
        alert('No hay morosos para copiar');
        return;
    }

    items.forEach(item => {
        const nombre = item.querySelector('.moroso-nombre').textContent.replace('👤 ', '');
        const total = item.querySelector('.moroso-total').textContent;
        const detalles = item.querySelector('.moroso-detalles');
        
        texto += `${nombre}\n`;
        texto += `${detalles.innerText}\n`;
        texto += `TOTAL: ${total}\n`;
        texto += '-'.repeat(50) + '\n\n';
    });

    navigator.clipboard.writeText(texto).then(() => {
        alert('✅ Informe copiado al portapapeles');
    }).catch(() => {
        alert('Error al copiar');
    });
}

// ===== CUENTA POR SOCIO =====
function actualizarSelectSociosCuenta() {
    const select = document.getElementById('selectSocio');
    const sociosActivos = socios.filter(s => s.activo);
    
    select.innerHTML = '<option value="">Selecciona un socio</option>';
    sociosActivos.forEach(socio => {
        const option = document.createElement('option');
        option.value = socio.id;
        option.textContent = socio.nombre;
        select.appendChild(option);
    });
}

function mostrarCuentaSocio(e) {
    const socioId = parseInt(e.target.value);
    const container = document.getElementById('cuentaSocioDetalle');
    
    if (!socioId) {
        container.innerHTML = '<p style="text-align: center; padding: 30px; color: #64748b;">Selecciona un socio para ver su cuenta</p>';
        return;
    }

    const socio = socios.find(s => s.id === socioId);
    const movSocio = movimientos.filter(m => m.tipo === 'entrada' && m.socioId === socioId);

    let totalEntradas = 0;
    let totalSalidas = 0;

    // Las salidas se distribuyen entre todos los socios activos
    const sociosActivos = socios.filter(s => s.activo).length;
    const totalSalidasGlobal = movimientos
        .filter(m => m.tipo === 'salida')
        .reduce((sum, m) => sum + m.cantidad, 0);
    
    totalSalidas = sociosActivos > 0 ? totalSalidasGlobal / sociosActivos : 0;

    movSocio.forEach(m => {
        totalEntradas += m.cantidad;
    });

    const balance = totalEntradas - totalSalidas;

    let html = `
        <div class="cuenta-header">
            <div class="cuenta-stat">
                <div class="cuenta-stat-label">Nombre</div>
                <div style="font-size: 1.3em; font-weight: 600; color: #1e293b;">${socio.nombre}</div>
            </div>
            <div class="cuenta-stat">
                <div class="cuenta-stat-label">Total Pagado</div>
                <div class="cuenta-stat-value">€${totalEntradas.toFixed(2)}</div>
            </div>
            <div class="cuenta-stat">
                <div class="cuenta-stat-label">Gastos Asociados</div>
                <div class="cuenta-stat-value negativo">-€${totalSalidas.toFixed(2)}</div>
            </div>
            <div class="cuenta-stat">
                <div class="cuenta-stat-label">Balance</div>
                <div class="cuenta-stat-value ${balance >= 0 ? '' : 'negativo'}">€${balance.toFixed(2)}</div>
            </div>
        </div>
    `;

    if (movSocio.length === 0) {
        html += '<p style="text-align: center; padding: 20px; color: #64748b;">Este socio no tiene movimientos registrados</p>';
    } else {
        html += '<div class="cuenta-movimientos"><h4>📝 Detalle de Cuotas Pagadas</h4>';
        movSocio.sort((a, b) => new Date(b.mes) - new Date(a.mes)).forEach(mov => {
            html += `
                <div class="movimiento-row">
                    <div class="movimiento-mes">${mov.mes}</div>
                    <div class="movimiento-desc">Cuota</div>
                    <div class="movimiento-cantidad entrada">+€${mov.cantidad.toFixed(2)}</div>
                    <div>${mov.notas || '-'}</div>
                </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;
}

// ===== UTILIDADES =====
function guardarDatos() {
    localStorage.setItem('socios', JSON.stringify(socios));
    localStorage.setItem('movimientos', JSON.stringify(movimientos));
}

function actualizarTodo() {
    actualizarDashboard();
    actualizarTablaSocios();
    actualizarTablaMovimientos();
    actualizarMorosos();
}