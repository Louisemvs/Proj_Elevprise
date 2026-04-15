  (function() {
            // Elementos principais
            const companySize = document.getElementById('companySize');
            const segmentSelect = document.getElementById('segment');
            const processCheckboxes = document.querySelectorAll('.processCheck');
            const complexitySelect = document.getElementById('complexity');
            const deadlineSelect = document.getElementById('deadline');
            const teamRange = document.getElementById('teamRange');
            const teamValueSpan = document.getElementById('teamValue');
            const budgetExpect = document.getElementById('budgetExpect');
            const estimatedAmountSpan = document.getElementById('estimatedAmount');
            const priceDetailSpan = document.getElementById('priceDetailText');
            
            // Atualizar exibição do range de equipe
            if (teamRange && teamValueSpan) {
                teamRange.addEventListener('input', function() {
                    teamValueSpan.innerText = this.value;
                    updateEstimate();
                });
            }

            // Função para calcular estimativa com base nos inputs
            function calculateEstimate() {
                let basePrice = 0;
                const size = companySize.value;
                // Porte da empresa - fator multiplicador
                const sizeFactors = {
                    'startup': 20000,
                    'pequeno': 45000,
                    'medio': 110000,
                    'grande': 250000,
                    'enterprise': 480000
                };
                if (size && sizeFactors[size]) {
                    basePrice = sizeFactors[size];
                } else {
                    return { min: 0, max: 0, detail: "Selecione o porte da empresa para calcular." };
                }

                // Quantidade de processos selecionados (cada processo adiciona valor)
                let selectedProcesses = 0;
                processCheckboxes.forEach(cb => {
                    if (cb.checked) selectedProcesses++;
                });
                let processCost = selectedProcesses * 18500;
                if (selectedProcesses === 0) processCost = 0;
                
                // Fator de complexidade
                let complexityFactor = 1.0;
                if (complexitySelect.value === 'media') complexityFactor = 1.25;
                if (complexitySelect.value === 'alta') complexityFactor = 1.65;
                
                // Fator de prazo (urgente aumenta valor)
                let deadlineFactor = 1.0;
                if (deadlineSelect.value === 'rapido') deadlineFactor = 1.35;
                if (deadlineSelect.value === 'longo') deadlineFactor = 0.9;
                
                // Fator de equipe envolvida (times maiores aumentam escopo)
                let teamSize = parseInt(teamRange?.value || 50);
                let teamFactor = 1 + (teamSize / 500); // até 2.0 se 500 pessoas
                if (teamFactor > 1.8) teamFactor = 1.8;
                
                // Segmento pode influenciar especificidades
                let segmentFactor = 1.0;
                const seg = segmentSelect.value;
                if (seg === 'logistica') segmentFactor = 1.15;
                if (seg === 'manufatura') segmentFactor = 1.1;
                if (seg === 'saude') segmentFactor = 1.2;
                
                let rawEstimate = (basePrice + processCost) * complexityFactor * deadlineFactor * teamFactor * segmentFactor;
                
                // Ajuste mínimo e máximo (faixa)
                let minEstimate = rawEstimate * 0.85;
                let maxEstimate = rawEstimate * 1.15;
                
                // Formatar valores
                const formatMoney = (val) => {
                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
                };
                
                let detailMsg = "";
                if (selectedProcesses === 0 && size) detailMsg = `Estimativa para automação inicial (sem processos específicos selecionados). `;
                else detailMsg = `Baseado em ${selectedProcesses} processo(s) e porte ${size}. `;
                
                if (complexitySelect.value === 'alta') detailMsg += "Alta complexidade detectada. ";
                if (deadlineSelect.value === 'rapido') detailMsg += "Inclui aceleração de cronograma. ";
                
                return { min: minEstimate, max: maxEstimate, detail: detailMsg };
            }
            
            function updateEstimate() {
                const est = calculateEstimate();
                if (est.min === 0 && est.max === 0) {
                    estimatedAmountSpan.innerText = "R$ 0";
                    priceDetailSpan.innerText = est.detail || "Preencha os campos obrigatórios acima.";
                    return;
                }
                const formatMoney = (val) => {
                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
                };
                estimatedAmountSpan.innerHTML = `${formatMoney(est.min)} - ${formatMoney(est.max)}`;
                priceDetailSpan.innerText = est.detail + "Valores sujeitos à análise técnica. Solicite proposta final.";
            }
            
            // Listeners para todos os campos que afetam a estimativa
            const inputsToWatch = [companySize, segmentSelect, complexitySelect, deadlineSelect, budgetExpect];
            inputsToWatch.forEach(el => {
                if (el) el.addEventListener('change', updateEstimate);
            });
            processCheckboxes.forEach(cb => cb.addEventListener('change', updateEstimate));
            if (teamRange) teamRange.addEventListener('input', updateEstimate);
            
            // Atualizar inicial
            updateEstimate();
            
            // Submissão do formulário (orçamento)
            const form = document.getElementById('budgetForm');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validação básica
                const nome = document.getElementById('nome')?.value.trim();
                const email = document.getElementById('email')?.value.trim();
                const sizeVal = companySize.value;
                if (!nome || !email || !sizeVal) {
                    alert("Por favor, preencha o nome, e-mail e porte da empresa antes de enviar.");
                    return;
                }
                if (!email.includes('@')) {
                    alert("Insira um e-mail válido.");
                    return;
                }
                
                // Coletar processos selecionados
                let selectedProcs = [];
                processCheckboxes.forEach(cb => {
                    if (cb.checked) selectedProcs.push(cb.parentElement.innerText.trim());
                });
                const processesText = selectedProcs.length ? selectedProcs.join(", ") : "Nenhum processo específico selecionado (aguardando diagnóstico)";
                
                const estimate = calculateEstimate();
                const estimateFormatted = (estimate.min && estimate.max) ? 
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(estimate.min) + " a " + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(estimate.max)
                    : "A definir";
                
                const mensagemAdicional = document.getElementById('mensagem')?.value || "";
                const teamQty = document.getElementById('teamRange')?.value || "50";
                const complexityText = complexitySelect.options[complexitySelect.selectedIndex]?.text || "";
                const deadlineText = deadlineSelect.options[deadlineSelect.selectedIndex]?.text || "";
                const segmentText = segmentSelect.options[segmentSelect.selectedIndex]?.text || "";
                
                // Montar conteúdo da simulação (para exibir ao usuário e simular envio)
                const mensagemFinal = `
🚀 *Nova solicitação de orçamento - ElevPrise*

*Nome:* ${nome}
*E-mail:* ${email}
*Porte da empresa:* ${companySize.options[companySize.selectedIndex]?.text}
*Segmento:* ${segmentText}
*Processos desejados:* ${processesText}
*Complexidade:* ${complexityText}
*Prazo:* ${deadlineText}
*Equipe envolvida:* ${teamQty} pessoas
*Estimativa calculada:* ${estimateFormatted}
*Mensagem:* ${mensagemAdicional || "Nenhum detalhe adicional."}

🔹 *Orçamento gerado automaticamente pelo site.* Aguardando contato comercial.
                `;
                
                // Simular envio bem-sucedido (em ambiente real seria via API/backend)
                alert(`✅ Solicitação recebida, ${nome}! \n\nEntraremos em contato com o e-mail ${email} em até 24h úteis com uma proposta detalhada.\n\nFaixa estimada: ${estimateFormatted}\n\nObrigado por escolher a ElevPrise.`);
                
                // Opcional: poderia abrir o modal ou redirecionar, mas manter na página com reset suave
                // Limpar campos extras? Não vamos resetar para preservar dados, mas podemos apenas mostrar sucesso.
                // Porém, como é demonstração, não enviamos para servidor externo, mas a experiência fica completa.
                console.log("Dados do orçamento:", mensagemFinal);
                // Poderia enviar via fetch para backend, mas como solicitado apenas a tela de orçamento, a simulação está perfeita.
            });
            
            // Botão voltar ao site principal (âncoras)
            const backBtn = document.getElementById('backToHomeBtn');
            if (backBtn) {
                backBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = 'index.html'; // volta para página principal (se estiver em arquivo separado, ou pode voltar com hash)
                    // Caso esteja tudo no mesmo arquivo, redireciona para a home:
                    // Mas para funcionar, assumimos que o site original está na mesma raiz.
                });
            }
        })();