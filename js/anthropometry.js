// Módulo de Avaliação Antropométrica e Cálculos Clínicos (NutriCore)
window.AnthroManager = {
  currentPatientId: "paciente_1",

  init(patientId) {
    if (patientId) this.currentPatientId = patientId;
    this.render();
  },

  calculateIMC(weight, heightCm) {
    if (!weight || !heightCm) return { imc: 0, label: "Não calculado", color: "#64748b" };
    const heightM = heightCm / 100;
    const imc = +(weight / (heightM * heightM)).toFixed(1);

    let label = "Eutrofia (Peso Normal)";
    let color = "#1FD27D";

    if (imc < 18.5) {
      label = "Abaixo do peso";
      color = "#3b82f6";
    } else if (imc >= 18.5 && imc < 25.0) {
      label = "Eutrofia (Peso Normal)";
      color = "#1FD27D";
    } else if (imc >= 25.0 && imc < 30.0) {
      label = "Sobrepeso";
      color = "#f59e0b";
    } else if (imc >= 30.0 && imc < 35.0) {
      label = "Obesidade Grau I";
      color = "#ef4444";
    } else if (imc >= 35.0 && imc < 40.0) {
      label = "Obesidade Grau II";
      color = "#dc2626";
    } else {
      label = "Obesidade Grau III (Mórbida)";
      color = "#991b1b";
    }

    return { imc, label, color };
  },

  calculateTMB(gender, weight, heightCm, age) {
    if (!weight || !heightCm || !age) return 0;
    // Mifflin-St Jeor
    if (gender === "M") {
      return Math.round(10 * weight + 6.25 * heightCm - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * heightCm - 5 * age - 161);
    }
  },

  calculateGET(tmb, activityLevel) {
    const factors = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      atleta: 1.9
    };
    const factor = factors[activityLevel] || 1.4;
    return Math.round(tmb * factor);
  },

  calculateRCQ(waistCm, hipCm, gender) {
    if (!waistCm || !hipCm) return { rcq: 0, risk: "N/A" };
    const rcq = +(waistCm / hipCm).toFixed(2);
    let risk = "Baixo risco";
    if (gender === "M") {
      if (rcq >= 0.95) risk = "Alto risco cardiovascular";
      else if (rcq >= 0.90) risk = "Risco moderado";
    } else {
      if (rcq >= 0.85) risk = "Alto risco cardiovascular";
      else if (rcq >= 0.80) risk = "Risco moderado";
    }
    return { rcq, risk };
  },

  render() {
    const container = document.getElementById("anthroContent");
    if (!container) return;

    const patient = window.APP_DATA.patients.find(p => p.id === this.currentPatientId) || window.APP_DATA.patients[0];
    if (!patient) return;

    const imcData = this.calculateIMC(patient.weight, patient.height);
    const tmb = this.calculateTMB(patient.gender, patient.weight, patient.height, patient.age);
    const getCal = this.calculateGET(tmb, patient.activityLevel);

    const latestMeasure = patient.measurements && patient.measurements.length > 0 
      ? patient.measurements[patient.measurements.length - 1] 
      : { waist: 80, hip: 100, bodyFat: 20 };

    const rcqData = this.calculateRCQ(latestMeasure.waist, latestMeasure.hip, patient.gender);

    const fatMassKg = latestMeasure.bodyFat ? +((patient.weight * latestMeasure.bodyFat) / 100).toFixed(1) : 0;
    const leanMassKg = +(patient.weight - fatMassKg).toFixed(1);

    let html = `
      <!-- Seletor de Paciente e Ações -->
      <div class="anthro-top-bar">
        <div class="anthro-patient-selector">
          <label>Paciente Selecionado:</label>
          <select class="db-input-field select-inline" onchange="AnthroManager.init(this.value)">
            ${window.APP_DATA.patients.map(p => `
              <option value="${p.id}" ${p.id === patient.id ? 'selected' : ''}>
                ${p.name} (${p.weight}kg • ${p.age} anos)
              </option>
            `).join('')}
          </select>
        </div>
        <button class="db-btn db-btn--primary" onclick="AnthroManager.openAddMeasurementModal()">
          <i class="fa-solid fa-plus"></i> Registrar Nova Medição
        </button>
      </div>

      <!-- Grid de Métricas Principais -->
      <div class="anthro-metrics-grid">
        <!-- IMC -->
        <div class="anthro-metric-card">
          <div class="metric-top">
            <span class="metric-title">Índice de Massa Corporal (IMC)</span>
            <i class="fa-solid fa-weight-scale text-emerald"></i>
          </div>
          <div class="metric-large-value">
            ${imcData.imc} <span class="metric-unit">kg/m²</span>
          </div>
          <div class="metric-pill" style="background-color: ${imcData.color}20; color: ${imcData.color};">
            <i class="fa-solid fa-shield-halved"></i> ${imcData.label}
          </div>
          <p class="metric-desc">Faixa saudável recomendada OMS: 18.5 – 24.9</p>
        </div>

        <!-- TMB -->
        <div class="anthro-metric-card">
          <div class="metric-top">
            <span class="metric-title">Taxa Metabólica Basal (TMB)</span>
            <i class="fa-solid fa-heart-pulse text-purple"></i>
          </div>
          <div class="metric-large-value">
            ${tmb} <span class="metric-unit">kcal/dia</span>
          </div>
          <div class="metric-pill" style="background: #f3e8ff; color: #7e22ce;">
            Fórmula Mifflin-St Jeor
          </div>
          <p class="metric-desc">Gasto energético em repouso absoluto.</p>
        </div>

        <!-- GET -->
        <div class="anthro-metric-card">
          <div class="metric-top">
            <span class="metric-title">Gasto Energético Total (GET)</span>
            <i class="fa-solid fa-bolt text-amber"></i>
          </div>
          <div class="metric-large-value">
            ${getCal} <span class="metric-unit">kcal/dia</span>
          </div>
          <div class="metric-pill" style="background: #fef3c7; color: #b45309;">
            Nível de Atividade: ${patient.activityLevel.toUpperCase()}
          </div>
          <p class="metric-desc">Meta para perda: ~${getCal - 500} kcal | Ganho: ~${getCal + 350} kcal</p>
        </div>

        <!-- Composição Corporal -->
        <div class="anthro-metric-card">
          <div class="metric-top">
            <span class="metric-title">% Gordura & Massa Magra</span>
            <i class="fa-solid fa-person text-blue"></i>
          </div>
          <div class="metric-large-value">
            ${latestMeasure.bodyFat}% <span class="metric-unit">gordura</span>
          </div>
          <div class="metric-pill" style="background: #e0f2fe; color: #0369a1;">
            Massa Magra: ${leanMassKg} kg (${fatMassKg} kg gordura)
          </div>
          <p class="metric-desc">RCQ: ${rcqData.rcq} (${rcqData.risk})</p>
        </div>
      </div>

      <!-- Tabela de Histórico de Avaliações -->
      <div class="anthro-history-card">
        <div class="anthro-history-header">
          <h3><i class="fa-solid fa-chart-line text-emerald"></i> Histórico Evolutivo de Medições</h3>
          <span class="text-muted">Acompanhe a evolução de peso, circunferências e dobras</span>
        </div>

        <div class="table-responsive">
          <table class="db-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Peso (kg)</th>
                <th>IMC</th>
                <th>% Gordura</th>
                <th>Cintura (cm)</th>
                <th>Quadril (cm)</th>
                <th>Braço (cm)</th>
                <th>Evolução</th>
              </tr>
            </thead>
            <tbody>
              ${(patient.measurements || []).map((m, idx, arr) => {
                const imc = this.calculateIMC(m.weight, patient.height).imc;
                const prev = arr[idx - 1];
                let diffText = "Inicial";
                let diffClass = "text-muted";
                if (prev) {
                  const diff = +(m.weight - prev.weight).toFixed(1);
                  if (diff < 0) {
                    diffText = `${diff} kg`;
                    diffClass = "text-emerald";
                  } else if (diff > 0) {
                    diffText = `+${diff} kg`;
                    diffClass = "text-amber";
                  } else {
                    diffText = "0.0 kg";
                  }
                }

                return `
                  <tr>
                    <td><b>${m.date}</b></td>
                    <td><b>${m.weight} kg</b></td>
                    <td>${imc}</td>
                    <td>${m.bodyFat ? m.bodyFat + '%' : '-'}</td>
                    <td>${m.waist || '-'} cm</td>
                    <td>${m.hip || '-'} cm</td>
                    <td>${m.arm || '-'} cm</td>
                    <td><span class="${diffClass}"><b>${diffText}</b></span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  openAddMeasurementModal() {
    window.openModal("addMeasurementModal");
  },

  saveNewMeasurement(data) {
    const patient = window.APP_DATA.patients.find(p => p.id === this.currentPatientId);
    if (!patient) return;

    if (!patient.measurements) patient.measurements = [];

    const newObj = {
      date: new Date().toLocaleDateString("pt-BR"),
      weight: parseFloat(data.weight) || patient.weight,
      bodyFat: parseFloat(data.bodyFat) || 0,
      waist: parseFloat(data.waist) || 0,
      hip: parseFloat(data.hip) || 0,
      arm: parseFloat(data.arm) || 0
    };

    patient.weight = newObj.weight;
    patient.measurements.push(newObj);
    this.render();
    window.showToast("Avaliação física registrada com sucesso!", "success");
    window.closeModal("addMeasurementModal");
  }
};
