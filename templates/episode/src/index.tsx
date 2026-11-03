import React from 'react';
import {registerRoot,Composition} from 'remotion';
import {Film} from './Film';
import {E} from './config';
registerRoot(()=> <Composition id="Episode" component={Film} durationInFrames={Math.ceil(E.duration*E.fps)} fps={E.fps} width={E.width} height={E.height}/>);
