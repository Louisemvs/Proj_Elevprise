
        (function() {
            // Garantir que todos os links internos com # rolem suavemente mesmo com scroll-behavior: smooth
            const linksInternos = document.querySelectorAll('a[href^="#"]');
            linksInternos.forEach(link => {
                link.addEventListener('click', function(e) {
                    const hash = this.getAttribute('href');
                    if (hash === "#" || hash === "") return;
                    const targetElement = document.querySelector(hash);
                    if (targetElement) {
                        e.preventDefault();
                        const offsetTop = targetElement.offsetTop - 85; // compensar navbar fixa
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                        // Atualizar url hash sem saltar abruptamente
                        history.pushState(null, null, hash);
                    }
                });
            });

            // Modal de contato (pequeno extra, mas sem conflito)
            const modal = document.getElementById('modalContato');
            const openBtn = document.getElementById('openContactModal');
            const closeModalBtn = document.getElementById('fecharModal');
            const enviarBtn = document.getElementById('enviarModal');

            if (openBtn && modal) {
                openBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    modal.style.display = 'flex';
                });
                const closeModal = () => {
                    modal.style.display = 'none';
                };
                if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
                if (enviarBtn) {
                    enviarBtn.addEventListener('click', () => {
                        const emailInput = document.getElementById('modalEmail');
                        if (emailInput && emailInput.value.trim() !== "") {
                            alert(`Obrigado! Em breve entraremos em contato com ${emailInput.value.trim()}.`);
                            modal.style.display = 'none';
                            emailInput.value = '';
                        } else {
                            alert("Por favor, insira um e-mail válido para contato.");
                        }
                    });
                }
                // fechar ao clicar fora do conteúdo
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.style.display = 'none';
                });
            }

            // Adicionar uma classe de animação sutil nos cards conforme scroll (apenas para experiência)
            const cards = document.querySelectorAll('.card, .dif-item, .sobre-text');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(18px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                observer.observe(card);
            });

            // garantir que hero fade-up já aparece (já tem classe fade-up)
            document.querySelectorAll('.fade-up').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        })();
    