export function SimpleFooter() {
  return (
    <footer className="w-full py-4 px-4 border-t bg-slate-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
        <div className="text-center md:text-left">
          <span className="font-semibold text-slate-700">Mindwhile IT Solutions Pvt. Ltd.</span>
          <span className="hidden md:inline"> | </span>
          <span className="block md:inline">2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010</span>
        </div>
        <div className="text-center">
          <span className="text-blue-600 font-medium">Raksha Assist</span> - Not an insurance product
        </div>
        <div className="text-center md:text-right">
          © 2026 All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
