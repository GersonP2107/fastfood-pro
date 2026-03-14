'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
    return (
        <div className="relative overflow-hidden bg-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-rose-50/50">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ea580c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/50 to-white pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 sm:pt-32 sm:pb-40">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-[#fa0050] font-medium text-sm mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fa0050] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fa0050]"></span>
                        </span>
                        La plataforma #1 de menús digitales
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex justify-center mb-6"
                    >
                        <span className="sr-only">FoodFast Pro</span>
                        <Image
                            src="/logo-horizontal.svg"
                            alt="FoodFast Pro"
                            width={400}
                            height={120}
                            priority
                            className="w-auto h-20 md:h-28"
                        />
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed"
                    >
                        Descubre los mejores restaurantes, explora sus menús interactivos y ordena tu comida favorita con facilidad.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex justify-center gap-4"
                    >
                        <button
                            onClick={() => {
                                const element = document.getElementById('directory');
                                element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="group flex items-center gap-2 bg-black hover:border-gray-800 hover:border-2 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 hover:text-black  transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            Ver Restaurantes
                            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Floating Elements Animation */}
            <FloatingIcon emoji="🍔" top="15%" left="10%" delay={0} />
            <FloatingIcon emoji="🍕" top="20%" right="15%" delay={1} />
            <FloatingIcon emoji="🌮" bottom="20%" left="15%" delay={2} />
            <FloatingIcon emoji="🍣" bottom="25%" right="10%" delay={3} />
        </div>
    );
}

function FloatingIcon({ emoji, top, left, right, bottom, delay }: { emoji: string, top?: string, left?: string, right?: string, bottom?: string, delay: number }) {
    return (
        <motion.div
            className="absolute text-4xl md:text-6xl opacity-20 pointer-events-none select-none"
            style={{ top, left, right, bottom }}
            animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
            }}
            transition={{
                duration: 5,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut",
            }}
        >
            {emoji}
        </motion.div>
    );
}
