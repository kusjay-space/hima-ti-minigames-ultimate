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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#080c14]/85 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-[#0d1424] border-2 border-[#1e2b46] p-3.5 sm:p-5 md:p-6 shadow-tactile flex flex-col max-h-[92vh]"
      >
        {/* Corner Crosshairs */}
        <div className="absolute top-1 left-1 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
        <div className="absolute top-1 right-1 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
        <div className="absolute bottom-1 left-1 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
        <div className="absolute bottom-1 right-1 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#1e2b46]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f59e0b] text-[#080c14] flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#f8fafc] tracking-tight">Papan Skor Maba</h2>
              <p className="text-[10px] sm:text-xs font-mono text-[#94a3b8]">Stand Booth HIMA TI // GMTI 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="p-2 bg-[#131e33] border border-[#1e2b46] text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-[#131e33] border border-[#1e2b46] text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto my-3 pr-1">
          {isLoading ? (
            <div className="py-16 text-center text-[#94a3b8] font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#2563eb]" />
              MEMUAT DATA SKOR STAND...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-[#64748b] font-mono text-xs">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-[#273b5e]" />
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
                        ? 'bg-[#141f36] border-[#f59e0b]/70 shadow-tactile-sm'
                        : isTop2
                        ? 'bg-[#10192b] border-[#38bdf8]/40'
                        : isTop3
                        ? 'bg-[#0e1728] border-[#1e2b46]'
                        : 'bg-[#090d16] border-[#162238]'
                    }`}
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-1">
                      <span
                        className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs shrink-0 border ${
                          isTop1
                            ? 'bg-[#f59e0b] text-[#080c14] border-[#fbbf24]'
                            : isTop2
                            ? 'bg-[#e2e8f0] text-[#080c14] border-white'
                            : isTop3
                            ? 'bg-[#b45309] text-white border-[#d97706]'
                            : 'bg-[#131e33] text-[#94a3b8] border-[#1e2b46]'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-[#f8fafc] truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[220px]">
                          {entry.nama_peserta}
                        </p>
                        <p className="text-[9.5px] sm:text-[10px] font-mono text-[#94a3b8] flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#38bdf8]" />
                          {entry.waktu_detik}s
                        </p>
                      </div>
                    </div>

                    {/* Score & Stamp Status */}
                    <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
                      <div>
                        <p className="font-bold font-mono text-sm sm:text-base text-[#38bdf8]">
                          {entry.skor} PTS
                        </p>
                      </div>

                      <div className="shrink-0 font-mono text-[9px] sm:text-[10px]">
                        {entry.status_cap === 'lolos' ? (
                          <span className="border border-[#10b981] bg-[#052e16] text-[#10b981] px-1.5 sm:px-2 py-0.5 font-bold uppercase">
                            CAP: LOLOS
                          </span>
                        ) : (
                          <span className="border border-[#f59e0b] bg-[#451a03] text-[#f59e0b] px-1.5 sm:px-2 py-0.5 font-bold uppercase">
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
        <div className="pt-2 border-t border-[#1e2b46] flex items-center justify-center text-[10px] font-mono text-[#64748b]">
          <span>HIMA TI // GMTI STAND 2026</span>
        </div>
      </motion.div>
    </div>
  );
};
