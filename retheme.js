const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const r = (from, to) => { c = c.split(from).join(to); };

// Section backgrounds
r('bg-rose-50', 'bg-[#FFF7ED]');
r('bg-orange-50 relative', 'bg-[#FFF7ED] relative');
r("className=\"py-24 px-4 bg-orange-50", 'className="py-24 px-4 bg-[#FFF7ED]');

// coral bg
r('bg-coral-500', 'bg-[#F97316]');
r('bg-coral-600', 'bg-[#ea6c00]');
r('bg-coral-50', 'bg-orange-50');
r('bg-coral-100', 'bg-orange-100');
r('bg-coral-400', 'bg-orange-400');
r('bg-coral-200', 'bg-orange-200');

// coral text
r('text-coral-600', 'text-[#F97316]');
r('text-coral-700', 'text-[#ea6c00]');
r('text-coral-500', 'text-[#F97316]');
r('text-coral-400', 'text-orange-400');

// coral border
r('border-coral-500', 'border-[#F97316]');
r('border-coral-400', 'border-orange-400');
r('border-coral-300', 'border-orange-300');
r('border-coral-200', 'border-orange-200');
r('border-coral-100', 'border-orange-100');

// coral gradients
r('from-coral-600', 'from-[#082F49]');
r('from-coral-500', 'from-[#082F49]');
r('via-rose-500', 'via-[#0F766E]');
r('to-coral-500', 'to-[#F97316]');
r('to-coral-600', 'to-[#ea6c00]');
r('to-rose-600', 'to-[#0F766E]');
r('to-rose-500', 'to-[#F97316]');

// Pre-footer CTA gradient
r('from-[#082F49] via-[#0F766E] to-[#F97316] py-16', 'py-16" style={{background:"linear-gradient(135deg,#082F49,#0F766E,#F97316)"}} className="relative overflow-hidden');

// shadow
r('shadow-coral-500/40', 'shadow-orange-500/30');
r('shadow-coral-500/30', 'shadow-orange-500/20');
r('shadow-coral-500/20', 'shadow-orange-500/15');
r('shadow-coral-500/10', 'shadow-orange-500/10');
r('shadow-coral-500/5', 'shadow-orange-500/5');

// focus
r('focus:border-coral-400', 'focus:border-[#0F766E]');
r('focus:ring-coral-500/10', 'focus:ring-[#0F766E]/10');

// hover text
r('hover:text-coral-600', 'hover:text-[#F97316]');
r('hover:text-coral-400', 'hover:text-orange-400');
r('hover:text-coral-700', 'hover:text-[#ea6c00]');

// hover bg
r('hover:bg-coral-50', 'hover:bg-orange-50');
r('hover:bg-coral-600', 'hover:bg-[#ea6c00]');

// group hover
r('group-hover:bg-coral-50', 'group-hover:bg-orange-50');
r('group-hover:text-coral-700', 'group-hover:text-[#F97316]');
r('group-hover:border-coral-100', 'group-hover:border-orange-100');
r('group-hover:text-coral-600', 'group-hover:text-[#F97316]');

// CTA button
r('text-[#F97316] px-10 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2', 'text-[#082F49] px-10 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2');

// About quote box gradient
r('bg-gradient-to-br from-[#082F49] to-[#0F766E] p-8', 'p-8 bg-[#082F49]');

// Community "Sightseeing" highlight
r('>Sightseeing</span>', ' style={{color:"#F97316"}}>Sightseeing</span>');

// Feature card colors
r("'bg-slate-900'", '"bg-[#082F49]"');
r("'bg-[#F97316]'", '"bg-[#F97316]"');
r("'bg-orange-500'", '"bg-[#0F766E]"');
r("'bg-[#0F766E]'", '"bg-[#0F766E]"');

// How it works steps
r("bg: 'bg-[#F97316]', numColor: 'text-[#F97316]'", "bg: 'bg-[#F97316]', numColor: 'text-[#F97316]'");
r("bg: 'bg-orange-500', numColor: 'text-orange-500'", "bg: 'bg-[#0F766E]', numColor: 'text-[#0F766E]'");
r("bg: 'bg-rose-500', numColor: 'text-rose-500'", "bg: 'bg-[#082F49]', numColor: 'text-[#082F49]'");
r("bg: 'bg-[#ea6c00]', numColor: 'text-[#ea6c00]'", "bg: 'bg-[#F97316]', numColor: 'text-[#F97316]'");

// Trips section progress bar
r('from-[#082F49] to-[#0F766E] rounded-full', 'from-[#0F766E] to-[#F97316] rounded-full');

// trips section bg
r('py-24 px-4 bg-[#FFF7ED] relative overflow-hidden">\n              <div className="absolute top-0 right-0 w-80 h-80 bg-[#F97316]', 'py-24 px-4 bg-[#FFF7ED] relative overflow-hidden">\n              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-200');

// footer logo bg
r('"bg-[#F97316] p-2.5 rounded-xl shadow-md"', '"p-2.5 rounded-xl shadow-md" style={{background:"#082F49"}}');

// Instagram btn
r('"bg-[#F97316] p-4 rounded-2xl hover:bg-[#ea6c00] transition-all hover:scale-110 shadow-lg shadow-orange-500/20 group"', '"p-4 rounded-2xl hover:scale-110 shadow-lg group" style={{background:"#F97316"}}');

// footer quick links hover
r('hover:text-[#F97316] transition flex', 'hover:text-orange-400 transition flex');

fs.writeFileSync('src/App.jsx', c);
console.log('Rethemed successfully');
