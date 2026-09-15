import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, RefreshCw, X } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-canvas/80 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-default border-2 border-default p-3.5 sm:p-5 md:p-6 shadow-tactile flex flex-col max-h-[92vh] text-default"
      >
        {/* Corner Crosshairs */}
        <div className="absolute top-1 left-1 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
        <div className="absolute top-1 right-1 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
        <div className="absolute bottom-1 left-1 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
        <div className="absolute bottom-1 right-1 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-default">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning text-white flex items-center justify-center font-bold shadow-sm">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-default tracking-tight">Papan Skor Maba</h2>
              <p className="text-[10px] sm:text-xs font-mono text-muted">Stand Booth HIMA TI // GMTI 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="p-2 bg-subtle border border-default text-subtle hover:text-default hover:border-primary transition-colors cursor-pointer"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-subtle border border-default text-subtle hover:text-default hover:border-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto my-3 pr-1">
          {isLoading ? (
            <div className="py-16 text-center text-muted font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              MEMUAT DATA SKOR STAND...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-muted font-mono text-xs">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-muted" />
              BELUM ADA PESERTA YANG TERCATAT. MULAI SEKARANG!
            </div>
          ) : (
            <div className="space-y-1.5">
              {entries.map((entry, idx) => {
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-2.5 border transition-all ${
                      isTop1
                        ? 'bg-accent/40 border-warning shadow-tactile-sm'
                        : isTop2
                        ? 'bg-subtle border-primary/40'
                        : isTop3
                        ? 'bg-subtle border-default'
                        : 'bg-default border-subtle'
                    }`}
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-1">
                      <span
                        className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs shrink-0 border ${
                          isTop1
                            ? 'bg-warning text-white border-warning'
                            : isTop2
                            ? 'bg-secondary text-white border-secondary'
                            : isTop3
                            ? 'bg-primary text-white border-primary'
                            : 'bg-muted text-subtle border-default'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-default truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[220px]">
                          {entry.nama_peserta}
                        </p>
                        <p className="text-[9.5px] sm:text-[10px] font-mono text-muted flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                          {entry.waktu_detik}s
                        </p>
                      </div>
                    </div>

                    {/* Score & Stamp Status */}
                    <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
                      <div>
                        <p className="font-bold font-mono text-sm sm:text-base text-primary">
                          {entry.skor} PTS
                        </p>
                      </div>

                      <div className="shrink-0 font-mono text-[9px] sm:text-[10px]">
                        {entry.status_cap === 'lolos' ? (
                          <span className="border border-success/30 bg-success/10 text-success px-1.5 sm:px-2 py-0.5 font-bold uppercase rounded-sm">
                            CAP: LOLOS
                          </span>
                        ) : (
                          <span className="border border-warning/30 bg-warning/10 text-warning px-1.5 sm:px-2 py-0.5 font-bold uppercase rounded-sm">
                            CAP: MISI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-default flex items-center justify-between text-[10px] font-mono text-muted">
          <span>HIMA TI // GMTI STAND 2026</span>
          <span>SINKRONISASI REAL-TIME LOCAL SQLITE</span>
        </div>
      </motion.div>
    </div>
  );
};
