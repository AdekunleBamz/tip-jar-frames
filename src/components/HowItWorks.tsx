export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect Wallet',
      description: 'Connect your wallet to create your personalized tip jar frame.',
      icon: '🔗',
    },
    {
      number: '02',
      title: 'Customize',
      description: 'Add your name, avatar, and set your preferred tip amounts.',
      icon: '✨',
    },
    {
      number: '03',
      title: 'Share',
      description: 'Post your frame URL in any Farcaster cast.',
      icon: '📤',
    },
    {
      number: '04',
      title: 'Receive Tips',
      description: 'Followers tip you directly without leaving Farcaster.',
      icon: '💜',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Create your tip jar in seconds and start receiving tips from your community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="card p-6 relative group hover:border-purple-500/30 transition">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                {step.number}
              </div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-slate-400">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 text-slate-600">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
