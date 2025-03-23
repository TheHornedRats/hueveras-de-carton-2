import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

import { precarga, crea, actualiza } from '../phaser/hueveras';

export default function HueverasGame() {
    const gameRef = useRef(null);    
    const phaserGame = useRef(null); 

    useEffect(() => {
        
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 450,
            parent: gameRef.current,
            scene: { preload: precarga, create: crea, update: actualiza }
        };

        phaserGame.current = new Phaser.Game(config);

        return () => {
            if (phaserGame.current) {
                phaserGame.current.destroy(true);
            }
        };
    }, []);

    return <div ref={gameRef} />;
}
