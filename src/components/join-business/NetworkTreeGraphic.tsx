import { useInView } from '@/hooks/use-in-view';

const NetworkTreeGraphic = () => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div ref={ref} className="mt-10">
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
        <h4 className="font-bold text-foreground text-lg mb-2 text-center">How You Earn From Your Network</h4>
        <p className="text-sm text-muted-foreground text-center mb-8 max-w-lg mx-auto">
          You earn the <strong className="text-foreground">difference</strong> between your bonus % and your team members' bonus %.
        </p>

        {/* Tree */}
        <div className="flex flex-col items-center gap-0">
          {/* YOU node */}
          <div
            className={`relative z-10 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-center shadow-lg transition-all duration-700 ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          >
            <div className="text-xs uppercase tracking-wider opacity-80">You</div>
            <div className="text-lg tabular-nums">28% OPB</div>
          </div>

          {/* Connector line down */}
          <div className={`w-px h-8 bg-primary/40 transition-all duration-500 delay-200 ${isInView ? 'opacity-100' : 'opacity-0'}`} />

          {/* Branch split */}
          <div className={`flex items-start gap-4 sm:gap-12 md:gap-20 transition-all duration-500 delay-300 ${isInView ? 'opacity-100' : 'opacity-0'}`}>
            {/* Left branch */}
            <div className="flex flex-col items-center">
              {/* Horizontal + vertical connector */}
              <div className="flex items-start">
                <div className="w-6 sm:w-12 md:w-16 h-px bg-primary/30 mt-0" />
                <div className="flex flex-col items-center">
                  <div className={`px-4 py-2.5 rounded-lg bg-accent/15 border border-accent/30 text-center transition-all duration-500 delay-400 hover:border-accent/60 hover:shadow-md ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="text-xs text-muted-foreground">Member A</div>
                    <div className="font-semibold text-foreground tabular-nums">9% OPB</div>
                  </div>
                  <div className={`w-px h-6 bg-accent/30 transition-all duration-300 delay-500 ${isInView ? 'opacity-100' : 'opacity-0'}`} />
                  <div className={`px-3 py-2 rounded-lg bg-muted/50 border border-border text-center transition-all duration-500 delay-600 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="text-xs text-muted-foreground">Team A</div>
                    <div className="text-sm font-medium text-foreground tabular-nums">5% OPB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right branch */}
            <div className="flex flex-col items-center">
              <div className="flex items-start">
                <div className="flex flex-col items-center">
                  <div className={`px-4 py-2.5 rounded-lg bg-accent/15 border border-accent/30 text-center transition-all duration-500 delay-500 hover:border-accent/60 hover:shadow-md ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="text-xs text-muted-foreground">Member B</div>
                    <div className="font-semibold text-foreground tabular-nums">13% OPB</div>
                  </div>
                  <div className={`w-px h-6 bg-accent/30 transition-all duration-300 delay-600 ${isInView ? 'opacity-100' : 'opacity-0'}`} />
                  <div className={`px-3 py-2 rounded-lg bg-muted/50 border border-border text-center transition-all duration-500 delay-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="text-xs text-muted-foreground">Team B</div>
                    <div className="text-sm font-medium text-foreground tabular-nums">9% OPB</div>
                  </div>
                </div>
                <div className="w-6 sm:w-12 md:w-16 h-px bg-primary/30 mt-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Earnings explanation */}
        <div className={`mt-8 grid sm:grid-cols-2 gap-3 max-w-md mx-auto transition-all duration-600 delay-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-xs text-muted-foreground">From A's team:</div>
            <div className="font-bold text-primary tabular-nums text-sm">28% − 9% = <span className="text-base">19%</span></div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-xs text-muted-foreground">From B's team:</div>
            <div className="font-bold text-primary tabular-nums text-sm">28% − 13% = <span className="text-base">15%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTreeGraphic;
