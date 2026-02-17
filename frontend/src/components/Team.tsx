import { Mail } from "lucide-react";

const team = [
  { name: "T. Manikumar", role: "Associate Professor & Advisor", email: "t.manikumar@klu.ac.in" },
  { name: "Kotapati Karthik", role: "Researcher", email: "karthikkotapati6@gmail.com" },
  { name: "Masina Jeevan", role: "Researcher", email: "masinajeevan@gmail.com" },
  { name: "K. Krishna Reddy", role: "Researcher", email: "krishnareddykommireddy14@gmail.com" },
  { name: "R. Neelima", role: "Researcher", email: "rangisettyneelima@gmail.com" },
];

const Team = () => {
  return (
    <section id="team" className="py-24 md:py-32 px-6 section-alt">
      <div className="container mx-auto">
        <p className="text-label text-muted-foreground mb-4">RESEARCH TEAM</p>
        <h2 className="text-section-title text-3xl sm:text-4xl md:text-5xl text-foreground max-w-2xl">
          Kalasalingam Academy of Research and Education
        </h2>
        <p className="mt-4 text-muted-foreground font-body text-base max-w-xl">
          Department of Computer Science Engineering, Krishnankoil, India
        </p>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="border border-border p-8 bg-background">
              <p className="text-section-title text-xl text-foreground">{member.name}</p>
              <p className="text-label text-muted-foreground mt-2">{member.role}</p>
              <a
                href={`mailto:${member.email}`}
                className="mt-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
              >
                <Mail className="w-4 h-4" />
                {member.email}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
