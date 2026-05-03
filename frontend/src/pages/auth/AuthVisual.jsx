import logo from '../../assets/logo.png';

const AuthVisual = () => {
    return (
        <div className="auth-visual-side">
            <div className="brand-hero-scene">
                {/* SVG Mask for circular logo clipping */}
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                        <clipPath id="circleView" clipPathUnits="objectBoundingBox">
                            <circle cx="0.5" cy="0.5" r="0.48" />
                        </clipPath>
                        
                        <filter id="metallicFinish">
                            <feSpecularLighting result="specOut" specularExponent="30" lightingColor="#ffffff">
                                <fePointLight x="50" y="50" z="200" />
                            </feSpecularLighting>
                            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
                            <feColorMatrix type="matrix" values="1.1 0 0 0 0.1
                                                                 0 1.1 0 0 0.1
                                                                 0 0 1.1 0 0.1
                                                                 0 0 0 1 0" />
                        </filter>
                    </defs>
                </svg>

                <div className="brand-hero-3d-container">
                    {/* Cinematic Neon Orbital Ring */}
                    <div className="orbital-neon-loop">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={`orbital-sparkle sparkle-${i}`}></div>
                        ))}
                    </div>

                    {/* 3-Layered 3D Extruded Logo (Simplified for Clarity) */}
                    <div className="logo-3d-stack">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={`logo-layer layer-${i}`} style={{ '--layer-idx': i }}>
                                <img src={logo} alt="TechNova 3D" className="hero-logo-img-3d" />
                            </div>
                        ))}
                        {/* Top Face with Subtle Reflection */}
                        <div className="logo-layer top-face">
                            <img src={logo} alt="TechNova Face" className="hero-logo-img-3d main-face" />
                            <div className="glossy-shine"></div>
                        </div>
                    </div>

                    {/* Realistic Ground Shadow & Reflection */}
                    <div className="hero-ground">
                        <div className="hero-shadow"></div>
                        <div className="hero-reflection"></div>
                    </div>

                    {/* High-Tech Particles */}
                    <div className="cinematic-particles">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="high-tech-particle"></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="auth-testimonial">
                <p className="testimonial-text">
                    "TechNova has completely transformed how we handle IT support. The ticketing system is intuitive, and the response times from technicians have improved significantly. Highly recommended!"
                </p>
                <div className="testimonial-author">
                    <div className="author-info">
                        <h4>Tharaniya Jeyapalan</h4>
                        <p>IT Operations Manager</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthVisual;
