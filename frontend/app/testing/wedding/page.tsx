'use client'

import { useState, useEffect } from 'react'
import { Heart, MapPin, Gift, Calendar, Clock, Instagram, Music, MusicOff, ChevronDown, MessageCircle, Send, Book } from 'lucide-react'

export default function WeddingInvitation() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('opening')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [wishes, setWishes] = useState<Array<{ name: string; message: string; attendance: string }>>([])
  const [formData, setFormData] = useState({ name: '', message: '', attendance: 'hadir' })

  const weddingDate = new Date('2024-02-15T10:00:00')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = weddingDate.getTime() - now

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['opening', 'quotes', 'couple', 'events', 'maps']
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetBottom = offsetTop + element.offsetHeight
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    if (!isOpen) setIsOpen(true)
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleOpenInvitation = () => {
    setIsOpen(true)
    setMusicPlaying(true)
  }

  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.message) {
      setWishes([...wishes, formData])
      setFormData({ name: '', message: '', attendance: 'hadir' })
    }
  }

  const [showBankInfo, setShowBankInfo] = useState<{ [key: string]: boolean }>({})

  const toggleBankInfo = (bank: string) => {
    setShowBankInfo(prev => ({ ...prev, [bank]: !prev[bank] }))
  }

  if (!isOpen) {
    return (
      <div className="wedding-cover">
        {/* Ornamental Corner Borders */}
        <svg className="ornament-corner ornament-top-left" viewBox="0 0 150 150" fill="none">
          <path d="M0 0 L150 0 C150 50 100 100 0 150 Z" fill="url(#goldGradient)" opacity="0.9"/>
          <path d="M10 10 C80 10 140 70 140 140" stroke="#d4af37" strokeWidth="2" fill="none"/>
          <circle cx="140" cy="10" r="3" fill="#eab308"/>
          <circle cx="10" cy="140" r="3" fill="#eab308"/>
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>

        <svg className="ornament-corner ornament-top-right" viewBox="0 0 150 150" fill="none">
          <path d="M150 0 L0 0 C0 50 50 100 150 150 Z" fill="url(#goldGradient2)" opacity="0.9"/>
          <path d="M140 10 C70 10 10 70 10 140" stroke="#d4af37" strokeWidth="2" fill="none"/>
          <circle cx="10" cy="10" r="3" fill="#eab308"/>
          <circle cx="140" cy="140" r="3" fill="#eab308"/>
          <defs>
            <linearGradient id="goldGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>

        <svg className="ornament-corner ornament-bottom-left" viewBox="0 0 150 150" fill="none">
          <path d="M0 150 L150 150 C150 100 100 50 0 0 Z" fill="url(#goldGradient3)" opacity="0.9"/>
          <path d="M10 140 C80 140 140 80 140 10" stroke="#d4af37" strokeWidth="2" fill="none"/>
          <circle cx="140" cy="140" r="3" fill="#eab308"/>
          <circle cx="10" cy="10" r="3" fill="#eab308"/>
          <defs>
            <linearGradient id="goldGradient3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>

        <svg className="ornament-corner ornament-bottom-right" viewBox="0 0 150 150" fill="none">
          <path d="M150 150 L0 150 C0 100 50 50 150 0 Z" fill="url(#goldGradient4)" opacity="0.9"/>
          <path d="M140 140 C70 140 10 80 10 10" stroke="#d4af37" strokeWidth="2" fill="none"/>
          <circle cx="10" cy="140" r="3" fill="#eab308"/>
          <circle cx="140" cy="10" r="3" fill="#eab308"/>
          <defs>
            <linearGradient id="goldGradient4" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>

        {/* Border Frame */}
        <div className="border-frame">
          <div className="border-top"></div>
          <div className="border-right"></div>
          <div className="border-bottom"></div>
          <div className="border-left"></div>
        </div>

        {/* Social Media Icons Sidebar */}
        <div className="social-sidebar">
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp">
            <MessageCircle size={20} />
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
            <Instagram size={20} />
          </a>
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="social-icon telegram">
            <Send size={20} />
          </a>
          <a href="#" className="social-icon share">
            <Book size={20} />
          </a>
        </div>

        {/* Main Content */}
        <div className="cover-content">
          {/* Gunungan / Wayang Symbol */}
          <div className="gunungan">
            <svg viewBox="0 0 200 280" fill="none" className="gunungan-svg">
              {/* Main triangle shape */}
              <path 
                d="M100 20 L40 200 L160 200 Z" 
                stroke="#d4af37" 
                strokeWidth="2" 
                fill="url(#wayang-gradient)"
              />
              
              {/* Inner decorative patterns */}
              <path 
                d="M100 40 L60 180 L140 180 Z" 
                stroke="#eab308" 
                strokeWidth="1.5" 
                fill="none"
              />
              
              {/* Center ornament */}
              <circle cx="100" cy="100" r="20" stroke="#d4af37" strokeWidth="1.5" fill="#00416A"/>
              <circle cx="100" cy="100" r="15" stroke="#eab308" strokeWidth="1" fill="none"/>
              
              {/* Decorative lines */}
              <line x1="100" y1="50" x2="100" y2="80" stroke="#d4af37" strokeWidth="2"/>
              <line x1="100" y1="120" x2="100" y2="170" stroke="#d4af37" strokeWidth="2"/>
              
              {/* Side ornaments */}
              <path d="M70 120 Q60 100 70 80" stroke="#eab308" strokeWidth="1.5" fill="none"/>
              <path d="M130 120 Q140 100 130 80" stroke="#eab308" strokeWidth="1.5" fill="none"/>
              
              {/* Bottom base */}
              <rect x="85" y="200" width="30" height="60" stroke="#d4af37" strokeWidth="2" fill="url(#wayang-gradient)"/>
              <line x1="85" y1="220" x2="115" y2="220" stroke="#eab308" strokeWidth="1"/>
              <line x1="85" y1="240" x2="115" y2="240" stroke="#eab308" strokeWidth="1"/>
              
              <defs>
                <linearGradient id="wayang-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.3"/>
                  <stop offset="50%" stopColor="#d4af37" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Couple Names */}
          <h1 className="couple-names">Kuntum & Gian</h1>

          {/* Guest Info */}
          <div className="guest-info">
            <p className="guest-label">Kepada Yth.</p>
            <p className="guest-label">Bapak/Ibu/Saudara/i</p>
            <p className="guest-name-label">Nama Tamu</p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button onClick={handleOpenInvitation} className="nav-item" title="Opening">
            <Book size={22} />
            <span>Opening</span>
          </button>
          <button onClick={() => scrollToSection('quotes')} className="nav-item" title="Quotes">
            <Heart size={22} />
            <span>Quotes</span>
          </button>
          <button onClick={() => scrollToSection('couple')} className="nav-item" title="Mempelai">
            <Heart size={22} />
            <span>Mempelai</span>
          </button>
          <button onClick={() => scrollToSection('events')} className="nav-item" title="Acara">
            <Calendar size={22} />
            <span>Acara</span>
          </button>
          <button onClick={() => scrollToSection('maps')} className="nav-item" title="Maps">
            <MapPin size={22} />
            <span>Maps</span>
          </button>
        </nav>

        <style jsx>{`
          .wedding-cover {
            min-height: 100vh;
            background: #00416A;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            padding: 2rem;
          }

          /* Ornamental Corners */
          .ornament-corner {
            position: absolute;
            width: 150px;
            height: 150px;
            pointer-events: none;
          }

          .ornament-top-left {
            top: 0;
            left: 0;
          }

          .ornament-top-right {
            top: 0;
            right: 0;
          }

          .ornament-bottom-left {
            bottom: 0;
            left: 0;
          }

          .ornament-bottom-right {
            bottom: 0;
            right: 0;
          }

          /* Border Frame */
          .border-frame {
            position: absolute;
            inset: 80px 40px;
            pointer-events: none;
          }

          .border-top,
          .border-bottom,
          .border-left,
          .border-right {
            position: absolute;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
          }

          .border-top {
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 2px;
          }

          .border-bottom {
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 2px;
          }

          .border-left {
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 2px;
            height: 60%;
            background: linear-gradient(180deg, transparent, #d4af37, transparent);
          }

          .border-right {
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 2px;
            height: 60%;
            background: linear-gradient(180deg, transparent, #d4af37, transparent);
          }

          /* Social Sidebar */
          .social-sidebar {
            position: fixed;
            right: 2.5rem;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 1rem;
            z-index: 1000;
          }

          .social-icon {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: all 0.3s ease;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          }

          .social-icon.whatsapp {
            background: #25D366;
          }

          .social-icon.instagram {
            background: linear-gradient(135deg, #833AB4, #E1306C, #FCAF45);
          }

          .social-icon.telegram {
            background: #0088cc;
          }

          .social-icon.share {
            background: #d4af37;
          }

          .social-icon:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
          }

          /* Main Content */
          .cover-content {
            text-align: center;
            color: white;
            z-index: 10;
            max-width: 500px;
          }

          /* Gunungan Symbol */
          .gunungan {
            margin: 0 auto 2rem;
          }

          .gunungan-svg {
            width: 200px;
            height: auto;
            filter: drop-shadow(0 10px 30px rgba(212, 175, 55, 0.3));
          }

          /* Couple Names */
          .couple-names {
            font-family: 'Great Vibes', cursive;
            font-size: 3.5rem;
            font-weight: 400;
            margin: 1.5rem 0;
            color: #eab308;
            text-shadow: 0 4px 20px rgba(234, 179, 8, 0.5);
            letter-spacing: 2px;
          }

          /* Guest Info */
          .guest-info {
            margin-top: 2rem;
            color: white;
          }

          .guest-label {
            font-size: 0.95rem;
            margin: 0.25rem 0;
            opacity: 0.9;
          }

          .guest-name-label {
            font-size: 1.2rem;
            font-weight: 600;
            margin-top: 1rem;
            color: #eab308;
          }

          /* Bottom Navigation */
          .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(212, 175, 55, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: space-around;
            padding: 0.75rem 1rem;
            z-index: 1000;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
          }

          .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            background: none;
            border: none;
            color: #00416A;
            cursor: pointer;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .nav-item:hover {
            transform: translateY(-3px);
            color: white;
          }

          .nav-item span {
            font-size: 0.7rem;
            text-transform: capitalize;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .social-sidebar {
              right: 1rem;
              gap: 0.75rem;
            }

            .social-icon {
              width: 40px;
              height: 40px;
            }

            .gunungan-svg {
              width: 160px;
            }

            .couple-names {
              font-size: 2.5rem;
            }

            .ornament-corner {
              width: 100px;
              height: 100px;
            }

            .border-frame {
              inset: 60px 20px;
            }

            .nav-item {
              padding: 0.4rem 0.5rem;
            }

            .nav-item span {
              font-size: 0.65rem;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      {/* Music Toggle */}
      <button 
        className="music-toggle"
        onClick={() => setMusicPlaying(!musicPlaying)}
      >
        {musicPlaying ? <Music size={20} /> : <MusicOff size={20} />}
      </button>

      <main className="wedding-main">
        {/* Opening Section */}
        <section id="opening" className="section section-opening">
          <div className="container">
            <h2 className="section-title">Bismillahirrahmanirrahim</h2>
            <p className="opening-text">Assalamualaikum Warahmatullohi Wabarakatuh</p>
          </div>
        </section>

        {/* Quranic Quote Section */}
        <section id="quotes" className="section section-quote">
          <div className="container">
            <p className="arabic-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <p className="quote-text">
              "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, 
              agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. 
              Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."
            </p>
            <p className="quote-ref">(QS. Ar-Ruum 30 : 21)</p>
          </div>
        </section>

        {/* Greeting Section */}
        <section className="section section-greeting">
          <div className="container">
            <p className="greeting-text">
              Maha Suci Allah SWT Yang telah menciptakan makhluk-Nya berpasang-pasangan, 
              Ya Allah dengan kerendahan hati, perkenankanlah kami menikahkan putra-putri kami tercinta
            </p>
          </div>
        </section>

        {/* Couple Section */}
        <section id="couple" className="section section-couple">
          <div className="container">
            <div className="couple-card">
              <div className="couple-photo bride-photo"></div>
              <h3 className="couple-name">Kuntum Indah Purnama Sari, M.Sn</h3>
              <p className="couple-desc">Putri ke dua</p>
              <p className="couple-parents">
                Bpk. Dr. H. Rusman Nurdin, S.Sen., M.Sn.<br />
                & Ibu Hj. Lilis Sriyeti, BA.
              </p>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="instagram-link">
                <Instagram size={20} />
                @instagram
              </a>
            </div>

            <div className="couple-divider">
              <Heart className="heart-icon" />
            </div>

            <div className="couple-card">
              <div className="couple-photo groom-photo"></div>
              <h3 className="couple-name">Gian Aditya Chandra, S.T., M.Tr.A.P.</h3>
              <p className="couple-desc">Putra ke empat</p>
              <p className="couple-parents">
                Bpk. Supriatna (Alm)<br />
                & Ibu Eti Rohayati
              </p>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="instagram-link">
                <Instagram size={20} />
                @instagram
              </a>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="section section-events">
          <div className="container">
            <h2 className="section-title">Acara Pernikahan</h2>
            <div className="divider"></div>

            <div className="event-card">
              <h3 className="event-title">Akad Nikah</h3>
              <div className="event-details">
                <Calendar className="event-icon" />
                <div>
                  <p className="event-date">Sabtu, 17 Februari 2024</p>
                  <p className="event-time">Pukul : 09.00 WIB s.d. Selesai</p>
                </div>
              </div>
              <div className="event-details">
                <MapPin className="event-icon" />
                <div>
                  <p className="event-venue">Rumah Lombok Bandung</p>
                  <p className="event-address">
                    Komp. Permata Biru Blok I No. 69H RT 04 RW 15<br />
                    Cinunuk Kec. Cileunyi Kab. Bandung
                  </p>
                </div>
              </div>
            </div>

            <div className="event-card event-card-primary">
              <div className="event-day">Kamis</div>
              <div className="event-date-large">15</div>
              <div className="event-month">FEB 2024</div>
              
              <h3 className="event-title">Undangan</h3>
              <p className="event-time">Pukul 10.00 s.d. 16.00 WIB</p>
              <p className="event-venue">Rumah Lombok Bandung</p>
              <p className="event-address">
                Komp. Permata Biru Blok I No. 69H RT 04 RW 15<br />
                Cinunuk Kec. Cileunyi Kab. Bandung
              </p>
            </div>

            <div className="countdown">
              <div className="countdown-item">
                <div className="countdown-value">{String(countdown.days).padStart(2, '0')}</div>
                <div className="countdown-label">Hari</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{String(countdown.hours).padStart(2, '0')}</div>
                <div className="countdown-label">Jam</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</div>
                <div className="countdown-label">Menit</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</div>
                <div className="countdown-label">Detik</div>
              </div>
            </div>
          </div>
        </section>

        {/* Maps Section */}
        <section id="maps" className="section section-maps">
          <div className="container">
            <h2 className="section-title">Lokasi Acara</h2>
            <div className="divider"></div>
            
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5267!2d107.6192617!3d-6.9078652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTQnMjguMyJTIDEwN8KwMzcnMDkuMyJF!5e0!3m2!1sen!2sid!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>

            <div className="map-info">
              <h4>Rumah Lombok Bandung</h4>
              <p>Komp. Permata Biru Blok I No. 69H RT 04 RW 15<br />Cinunuk Kec. Cileunyi Kab. Bandung</p>
              <a 
                href="https://www.google.com/maps/place/?q=-6.907865200000001,107.6192617" 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-button"
              >
                <MapPin size={18} />
                Petunjuk Ke Lokasi
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>Terima kasih atas kehadiran dan doa restu Anda</p>
        </footer>
      </main>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .wedding-main {
          background: #f8fafc;
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .music-toggle {
          position: fixed;
          bottom: 6rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #d4af37;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
          z-index: 999;
          transition: all 0.3s ease;
        }

        .music-toggle:hover {
          transform: scale(1.1);
        }

        .section {
          padding: 4rem 2rem;
          position: relative;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .section-title {
          font-family: Georgia, serif;
          font-size: 2.5rem;
          text-align: center;
          color: #00416A;
          margin-bottom: 1rem;
        }

        .divider {
          width: 120px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #d4af37, transparent);
          margin: 2rem auto;
        }

        .section-opening {
          background: #00416A;
          color: white;
          min-height: 40vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .opening-text {
          text-align: center;
          font-size: 1.2rem;
          margin-top: 1rem;
        }

        .section-quote {
          background: white;
        }

        .arabic-text {
          font-size: 1.5rem;
          text-align: center;
          color: #00416A;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .quote-text {
          font-size: 1.1rem;
          line-height: 1.8;
          text-align: center;
          color: #475569;
          font-style: italic;
          margin-bottom: 1rem;
        }

        .quote-ref {
          text-align: center;
          color: #64748b;
          font-weight: 600;
        }

        .section-greeting {
          background: #f1f5f9;
        }

        .greeting-text {
          text-align: center;
          color: #475569;
          line-height: 1.8;
          font-size: 1.1rem;
        }

        .section-couple {
          background: white;
        }

        .couple-card {
          text-align: center;
          margin: 3rem auto;
        }

        .couple-photo {
          width: 220px;
          height: 220px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #00416A, #2563eb);
          box-shadow: 0 0 0 4px #d4af37, 0 0 0 8px white, 0 15px 50px rgba(0, 65, 106, 0.3);
        }

        .couple-name {
          font-family: Georgia, serif;
          font-size: 1.8rem;
          color: #00416A;
          margin-bottom: 0.5rem;
        }

        .couple-desc {
          color: #64748b;
          margin-bottom: 1rem;
        }

        .couple-parents {
          color: #475569;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .instagram-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #00416A;
          text-decoration: none;
          padding: 0.5rem 1.5rem;
          border: 2px solid #00416A;
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .instagram-link:hover {
          background: #00416A;
          color: white;
        }

        .couple-divider {
          text-align: center;
          margin: 3rem 0;
        }

        .heart-icon {
          color: #ef4444;
          animation: heartbeat 1.5s infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
        }

        .section-events {
          background: #f1f5f9;
        }

        .event-card {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          margin: 2rem 0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .event-card-primary {
          background: #00416A;
          color: white;
          text-align: center;
        }

        .event-day {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .event-date-large {
          font-size: 5rem;
          font-weight: 700;
          line-height: 1;
          margin: 0.5rem 0;
        }

        .event-month {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .event-title {
          font-family: Georgia, serif;
          font-size: 1.8rem;
          color: #00416A;
          margin-bottom: 1.5rem;
        }

        .event-card-primary .event-title {
          color: white;
        }

        .event-details {
          display: flex;
          gap: 1rem;
          margin: 1.5rem 0;
          align-items: flex-start;
        }

        .event-icon {
          color: #d4af37;
          flex-shrink: 0;
        }

        .event-date,
        .event-time,
        .event-venue,
        .event-address {
          color: #475569;
          line-height: 1.6;
        }

        .event-card-primary .event-time,
        .event-card-primary .event-venue,
        .event-card-primary .event-address {
          color: rgba(255,255,255,0.9);
        }

        .event-venue {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .countdown {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-top: 3rem;
        }

        .countdown-item {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .countdown-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #00416A;
        }

        .countdown-label {
          color: #64748b;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .section-maps {
          background: white;
        }

        .map-container {
          margin: 2rem 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .map-info {
          text-align: center;
          margin-top: 2rem;
        }

        .map-info h4 {
          font-size: 1.5rem;
          color: #00416A;
          margin-bottom: 0.5rem;
        }

        .map-info p {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .map-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2.5rem;
          background: #d4af37;
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
        }

        .map-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(212, 175, 55, 0.6);
        }

        .footer {
          background: #00416A;
          padding: 3rem 2rem;
          text-align: center;
          color: white;
        }

        @media (max-width: 768px) {
          .section {
            padding: 3rem 1rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .countdown {
            grid-template-columns: repeat(2, 1fr);
          }

          .couple-photo {
            width: 180px;
            height: 180px;
          }

          .music-toggle {
            bottom: 5.5rem;
            right: 1rem;
          }
        }
      `}</style>
    </>
  )
}
