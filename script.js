document.addEventListener("DOMContentLoaded", () => {
    
    // 0. إخفاء شاشة تحميل القطرة المائية بشكل ناعم
    const loader = document.getElementById('water-loader');
    if (loader) {
        // الانتظار لبضع ثوانٍ لرؤية حركة سقوط قطرة الماء كاملة ثم الإخفاء الدائم
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 2200); // 2.2 ثانية لتلائم توقيت الأنيمشن
    }

    // 1. شريط التنقل الشفاف الذكي
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. المحرك الفيزيائي الفائق النعومة (Lerbed 3D Parallax System)
    // هذا النظام يستخدم Lerp (Linear Interpolation) للوصول لنعومة 3D تنافس المواقع العالمية
    const scene = document.getElementById('scene-3d');
    if (scene) {
        const layers = scene.querySelectorAll('.layer');
        const container = scene.querySelector('.bottle-container');

        // القيم المستهدفة (التي يذهب إليها الماوس)
        let targetRotateX = 0;
        let targetRotateY = 0;
        let targetRatioX = 0;
        let targetRatioY = 0;

        // القيم الحالية (التي تقترب تدريجياً للقيم المستهدفة)
        let currentRotateX = 0;
        let currentRotateY = 0;
        let currentRatioX = 0;
        let currentRatioY = 0;

        // قيمة النعومة (كلما اقترب من الصفر زادت النعومة والوزن)
        const lerpFactor = 0.05; 

        window.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            const windowCX = window.innerWidth / 2;
            const windowCY = window.innerHeight / 2;

            // حساب التغير الجذري من -1 إلى 1
            targetRatioX = (x - windowCX) / windowCX;
            targetRatioY = (y - windowCY) / windowCY;

            // دوران بزاوية أقصاها 20 درجة
            targetRotateY = targetRatioX * 20; 
            targetRotateX = targetRatioY * -20;
        });

        // العودة للوضع الطبيعي ببطء عند خروج الماوس
        scene.addEventListener('mouseleave', () => {
            targetRotateX = 0;
            targetRotateY = 0;
            targetRatioX = 0;
            targetRatioY = 0;
        });

        // حلقة التحديث المستمرة 60 فريم بالثانية
        const heroSection = document.querySelector('.hero');
        const heroTitleElement = document.querySelector('.hero-title');
        const heroText = document.querySelector('.hero-title .text-glow');
        const textOptions = ["النقــــاء", "الحيــــاة", "الطبيعــة"];

        const renderLoop = () => {
            // معادلة Lerp : current = current + (target - current) * factor
            currentRotateX += (targetRotateX - currentRotateX) * lerpFactor;
            currentRotateY += (targetRotateY - currentRotateY) * lerpFactor;
            currentRatioX += (targetRatioX - currentRatioX) * lerpFactor;
            currentRatioY += (targetRatioY - currentRatioY) * lerpFactor;

            // 1. تطبيق الدوران الكامل وإمالة الزجاجة في المنظور (الزجاجة تميل بوضوح)
            container.style.transform = `rotateX(${currentRotateX * 1.5}deg) rotateY(${currentRotateY * 1.5}deg)`;

            // 2. الخلفية تتحرك (Background Movement)
            if (heroSection) {
                heroSection.style.backgroundPosition = `${50 + (currentRatioX * 50)}% ${50 + (currentRatioY * 50)}%`;
            }

            // 3. النص يتغير (يتبدل النص ويتحرك كمجسم 3D بظلاله)
            if (heroText && heroTitleElement) {
                // تغيير الكلمة بمجرد تحريك الماوس بعمق
                if (currentRatioX < -0.3 && heroText.innerText !== textOptions[0]) heroText.innerText = textOptions[0];
                else if (currentRatioX > 0.3 && heroText.innerText !== textOptions[2]) heroText.innerText = textOptions[2];
                else if (currentRatioX >= -0.3 && currentRatioX <= 0.3 && heroText.innerText !== textOptions[1]) heroText.innerText = textOptions[1];

                // تحريك النص بشكل فيزيائي رائع
                heroTitleElement.style.transform = `translateX(${currentRatioX * -40}px) translateY(${currentRatioY * -40}px)`;
                heroText.style.textShadow = `${currentRatioX * 50}px ${currentRatioY * 50}px 30px rgba(138, 221, 255, 0.5)`;
            }

            // 4. الماء يتحرك داخل الزجاجة (Water Slosh Effect)
            const bodies = document.querySelectorAll('.hero-body, .pocket-body, .sport-body, .family-body');
            bodies.forEach(body => {
                body.style.setProperty('--water-slosh-angle', `${currentRatioX * -25}deg`);
                body.style.setProperty('--water-slosh-y', `${currentRatioY * 20}px`);
            });

            // تطبيق الاستجابة الديناميكية لكل طبقة حسب العمق والتكبير
            layers.forEach(layer => {
                const depth = parseFloat(layer.getAttribute('data-depth')) || 0.5;
                
                // حركة موضعية (Translation) تعطيك إحساس بتسارع القطرات في الفضاء
                const moveX = currentRatioX * (depth * 60); 
                const moveY = currentRatioY * (depth * 60);
                
                // دوران مستقل لكل عنصر بناء على العمق (يعطي إحساس بالحياة للقطرات)
                const independentRotateX = currentRatioY * (depth * 15);
                const independentRotateY = currentRatioX * -(depth * 15);

                layer.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) rotateX(${independentRotateX}deg) rotateY(${independentRotateY}deg)`;
            });

            requestAnimationFrame(renderLoop);
        };
        
        // تشغيل المحرك
        renderLoop();
    }

    // 3. تأثير التموج المائي اليدوي (Interactive Hand-Drawn Water Ripples)
    const waveBox = document.getElementById('wave-box');
    if (waveBox) {
        let lastMove = 0;
        
        waveBox.addEventListener('mousemove', (e) => {
            const now = Date.now();
            // تحديد الـ Throttling لتقليل الضغط على المتصفح
            if(now - lastMove > 50) { 
                createRipple(e, waveBox);
                lastMove = now;
            }
        });
    }

    function createRipple(e, container) {
        const circle = document.createElement('div');
        const rect = container.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        circle.style.position = 'absolute';
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.style.width = '20px';
        circle.style.height = '20px';
        circle.style.border = '2px solid rgba(138, 221, 255, 0.6)';
        circle.style.boxShadow = '0 0 20px rgba(138, 221, 255, 0.4), inset 0 0 20px rgba(138, 221, 255, 0.4)';
        circle.style.borderRadius = '50%';
        circle.style.transform = 'translate(-50%, -50%)';
        circle.style.transition = 'all 2s ease-out';
        circle.style.pointerEvents = 'none';

        container.appendChild(circle);

        // توسع التدريجي الكلاسيكي
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                circle.style.width = '300px';
                circle.style.height = '300px';
                circle.style.borderWidth = '0px'; // يختفي الإطار بسلاسة
                circle.style.opacity = '0';
            });
        });

        // التنظيف
        setTimeout(() => {
            circle.remove();
        }, 2000);
    }


    // 4. الانبثاق الناعم أثناء التمرير العالي الدقة (Observer Pattern Reveal)
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // تشغيل لمرة واحدة فقط
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 5. تهيئة تأثير الإمالة للبطاقة التعريفية للكمبيوتر (VanillaTilt)
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
            max: 15,
            speed: 600,
            glare: true,
            "max-glare": 0.2,
            reverse: true,
            scale: 1.05
        });
    }

    // 6. التعامل مع إرسال الطلب بشكل أنيق جداً
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.querySelector('#contactForm button');
            const spanText = document.querySelector('#contactForm button span');
            const ogText = spanText.innerText;
            
            spanText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> إرسال...';
            btn.style.pointerEvents = 'none';
            btn.style.borderColor = 'rgba(138, 221, 255, 0.2)';

            setTimeout(() => {
                spanText.innerHTML = '<i class="fa-solid fa-check"></i> تم استلام رسالتك';
                btn.style.borderColor = '#00ffcc';
                btn.style.color = '#00ffcc';
                form.reset();
                
                setTimeout(()=> {
                    spanText.innerText = ogText;
                    btn.style.borderColor = '';
                    btn.style.color = '';
                    btn.style.pointerEvents = 'auto';
                }, 4000)
            }, 2000)
        });
    }
});
