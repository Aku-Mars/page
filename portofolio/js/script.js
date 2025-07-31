document.addEventListener('DOMContentLoaded', function() {
    const translations = {
        en: {
            nav_profile: "Profile",
            nav_experience: "Experience",
            nav_projects: "Projects",
            nav_certificates: "Certificates",
            nav_cv: "CV",
            profile_title: "Informatics Engineering Student, University of Lampung",
            profile_desc: "I am an Informatics Engineering student with a high enthusiasm in the IT field, especially Cloud Engineering. Experienced in the basics of Cloud Computing and Web Development, I am able to work in a team, manage complex projects, and am always eager to learn new things to find creative solutions. I have good communication skills and am committed to delivering high-quality results.",
            experience_title: "My Experience",
            exp1_date: "August 2024 - January 2025",
            exp1_title: "Cloud Computing Cohort & Capstone Project Lead",
            exp1_company: "Bangkit Academy",
            exp1_desc1: "Studied cloud architecture, GCP, and software engineering.",
            exp1_desc2: "Led the 'Mindcraft' capstone project as a Project Manager.",
            exp1_desc3: "Designed the backend architecture on GCP and developed core APIs.",
            exp2_date: "February 2025 - June 2025",
            exp2_title: "AI Program Participant, elevAlte with Dicoding",
            exp2_company: "Microsoft & Dicoding",
            exp2_desc1: "Studied Artificial Intelligence (AI) and Generative AI development.",
            exp2_desc2: "Mastered Microsoft's AI technology with a focus on the Azure cloud platform.",
            exp2_desc3: "Completed an intensive learning path to become an industry-ready AI talent.",
            exp3_date: "October 2022 - Present",
            exp3_title: "Freelance Cloud Engineer",
            exp3_company: "Freelance",
            exp3_desc1: "Provided cloud computing and web development solutions for various clients.",
            exp3_desc2: "Experienced in managing cloud services from AWS, GCP, Microsoft Azure, and Alibaba Cloud.",
            exp3_desc3: "Developed projects like the 'Mars Store' online shop from design to implementation on a VPS.",
            exp4_date: "June 2025 - Present",
            exp4_title: "Back End Developer Intern",
            exp4_company: "Diskominfosantik Kabupaten Serang",
            exp4_desc1: "Responsible for back-end development and operations.",
            exp4_desc2: "Implemented features and services using PHP, Laravel, and MySQL.",
            exp4_desc3: "Supported system maintenance and optimization in a government environment.",
            projects_title: "My Projects",
            proj1_title: "Mindcraft",
            proj1_desc: "An application that automatically generates quizzes from user material.",
            proj_view: "View Project",
            proj2_title: "Epic Dragon",
            proj2_desc: "A turn-based website game created with AI Studio technology.",
            proj3_title: "Host Monitoring Dashboard",
            proj3_desc: "A web interface to monitor host status in real-time.",
            proj4_title: "To-Do List Application",
            proj4_desc: "An application to manage a list of tasks or jobs to be done.",
            proj5_title: "Crime Management System",
            proj5_desc: "A desktop application to help police manage criminal data.",
            proj6_title: "Edge Detection & Template Matching",
            proj6_desc: "A collection of Python scripts for fundamental image processing.",
            proj7_title: "Jawari (Project in Progress)",
            proj7_desc: "A web-based application for the art of dance in Banten - DISPORAPAR",
            proj_soon: "Coming Soon",
            certificates_title: "My Certificates",
            cert1_title: "Learning Back-End for Beginners with JavaScript",
            cert2_title: "Becoming a Google Cloud Engineer",
            cert3_title: "Learning to Use Generative AI",
            cert4_title: "CCNA: Enterprise Networking, Security, and Automation",
            view_all: "View All",
            cv_title: "Interested in Collaborating?",
            cv_desc: "Check out my resume for more information.",
            cv_download: "Download My CV",
            footer_visitors: "Visitor Count:"
        },
        id: {
            nav_profile: "Profil",
            nav_experience: "Pengalaman",
            nav_projects: "Proyek",
            nav_certificates: "Sertifikat",
            nav_cv: "CV",
            profile_title: "Mahasiswa Teknik Informatika, Universitas Lampung",
            profile_desc: "Saya adalah seorang mahasiswa Teknik Informatika dengan antusiasme tinggi di bidang IT, khususnya <i>Cloud Engineering</i>. Berpengalaman dalam dasar-dasar <i>Cloud Computing</i> dan <i>Web Development</i>, saya mampu bekerja dalam tim, mengelola proyek kompleks, dan selalu bersemangat mempelajari hal-hal baru untuk menemukan solusi kreatif. Saya memiliki kemampuan komunikasi yang baik dan berkomitmen untuk memberikan hasil berkualitas tinggi.",
            experience_title: "Pengalaman Saya",
            exp1_date: "Agustus 2024 - Januari 2025",
            exp1_title: "Cloud Computing Cohort & Capstone Project Lead",
            exp1_company: "Bangkit Academy",
            exp1_desc1: "Mendalami arsitektur cloud, GCP, dan rekayasa perangkat lunak.",
            exp1_desc2: "Memimpin proyek capstone 'Mindcraft' sebagai Project Manager.",
            exp1_desc3: "Merancang arsitektur backend di GCP dan mengembangkan API inti.",
            exp2_date: "Februari 2025 - Juni 2025",
            exp2_title: "Peserta Program AI, elevAlte with Dicoding",
            exp2_company: "Microsoft & Dicoding",
            exp2_desc1: "Mendalami pengembangan Kecerdasan Buatan (AI) dan Generative AI.",
            exp2_desc2: "Menguasai teknologi AI dari Microsoft dengan fokus pada platform cloud Azure.",
            exp2_desc3: "Menyelesaikan jalur pembelajaran intensif untuk menjadi talenta AI yang siap industri.",
            exp3_date: "Oktober 2022 - Sekarang",
            exp3_title: "Freelance Cloud Engineer",
            exp3_company: "Freelance",
            exp3_desc1: "Menyediakan solusi cloud computing dan pengembangan web untuk berbagai klien.",
            exp3_desc2: "Berpengalaman mengelola layanan cloud dari AWS, GCP, Microsoft Azure, dan Alibaba Cloud.",
            exp3_desc3: "Mengembangkan proyek seperti toko online 'Mars Store' dari perancangan hingga implementasi di VPS.",
            exp4_date: "Juni 2025 - Sekarang",
            exp4_title: "Back End Developer Intern",
            exp4_company: "Diskominfosantik Kabupaten Serang",
            exp4_desc1: "Bertanggung jawab atas pengembangan dan operasional back-end.",
            exp4_desc2: "Mengimplementasikan fitur dan layanan menggunakan PHP, Laravel, dan MySQL.",
            exp4_desc3: "Mendukung pemeliharaan dan optimalisasi sistem di lingkungan pemerintahan.",
            projects_title: "Proyek Saya",
            proj1_title: "Mindcraft",
            proj1_desc: "Aplikasi penghasil kuis otomatis dari materi pengguna.",
            proj_view: "Lihat Proyek",
            proj2_title: "Epic Dragon",
            proj2_desc: "Sebuah game turn bases berbasis website dibuat dengan teknologi AI Studio",
            proj3_title: "Dashboard Monitoring Host",
            proj3_desc: "Antarmuka web untuk memantau status host secara real-time.",
            proj4_title: "Aplikasi To-Do List",
            proj4_desc: "Aplikasi untuk mengelola daftar tugas ataupun pekerjaan yang harus dilakukan.",
            proj5_title: "Sistem Manajemen Kriminal",
            proj5_desc: "Aplikasi desktop untuk membantu polisi mengelola data kriminal.",
            proj6_title: "Deteksi Tepi & Pencocokan Template",
            proj6_desc: "Kumpulan skrip Python untuk pemrosesan gambar fundamental.",
            proj7_title: "Jawari (Proyek Dalam Pengerjaan)",
            proj7_desc: "Aplikasi berbasis web untuk kesenian Tari di Banten - DISPORAPAR",
            proj_soon: "Segera Hadir",
            certificates_title: "Sertifikat Saya",
            cert1_title: "Belajar Back-End Pemula dengan JavaScript",
            cert2_title: "Menjadi Google Cloud Engineer",
            cert3_title: "Belajar Penggunaan Generative AI",
            cert4_title: "CCNA: Enterprise Networking, Security, and Automation",
            view_all: "Lihat Semua",
            cv_title: "Tertarik untuk Bekerja Sama?",
            cv_desc: "Lihat riwayat hidup saya untuk informasi lebih lanjut.",
            cv_download: "Unduh CV Saya",
            footer_visitors: "Jumlah Pengunjung:"
        }
    };

    const setLanguage = (lang) => {
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (translations[lang] && translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });
        document.documentElement.lang = lang;
    };

    const getInitialLanguage = () => {
        const browserLang = navigator.language.split('-')[0];
        return browserLang === 'id' ? 'id' : 'en';
    };

    // Set initial language
    const initialLang = getInitialLanguage();
    setLanguage(initialLang);

    // Add event listeners to language switchers
    document.querySelectorAll('.lang-switcher').forEach(button => {
        button.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    // Fetch view count from the database
    fetch('api/counter.php')
        .then(response => response.json())
        .then(data => {
            document.getElementById('view-count').innerText = data.count;
        })
        .catch(error => console.error('Error fetching view count:', error));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
