export function Features() {
  const features = [
    {
      title: 'Zero Friction',
      description: 'Tip creators without leaving Farcaster. One tap, done.',
      icon: '⚡',
    },
    {
      title: 'Built on Base',
      description: 'Low fees, fast transactions. Powered by Ethereum L2.',
      icon: '🔵',
    },
    {
      title: 'Instant Payments',
      description: 'Tips go directly to creator wallets. No delays.',
      icon: '💨',
    },
    {
      title: 'Transparent Fees',
      description: '2% protocol fee. No hidden costs. Open source.',
      icon: '🔍',
    },
    {
      title: 'Customizable',
      description: 'Set your name, avatar, and preferred tip amounts.',
      icon: '🎨',
    },
    {
      title: 'Social Native',
      description: 'Designed for Farcaster. Share anywhere, tip everywhere.',
      icon: '🌐',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-[var(--color-surface)]/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why <span className="gradient-text">Tip Jar</span>?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            The simplest way to support creators on Farcaster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6 hover:border-purple-500/30 transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
