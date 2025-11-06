import clsx from 'clsx';

import styles from './GoldenCanMark.module.css';

// Replace these placeholder imports with paths to your optimised SVG fragments.
import D from './assets/d.svg';
import E from './assets/e.svg';
import G from './assets/g.svg';
import L from './assets/l.svg';
import N from './assets/n.svg';
import O from './assets/o.svg';
import Vector from './assets/vector.svg';
import Vector2 from './assets/vector2.svg';
import Vector3 from './assets/vector3.svg';
import Vector4 from './assets/vector4.svg';
import Vector5 from './assets/vector5.svg';
import Vector6 from './assets/vector6.svg';
import Vector7 from './assets/vector7.svg';
import Vector8 from './assets/vector8.svg';

type GoldenCanMarkProps = {
  className?: string;
  caption?: string;
};

export function GoldenCanMark({ className, caption }: GoldenCanMarkProps) {
  return (
    <figure className={clsx(styles.wrapper, className)}>
      <svg
        className={styles.svg}
        viewBox="0 0 557 999"
        role="img"
        aria-labelledby="golden-can-title golden-can-desc"
      >
        <title id="golden-can-title">Golden Lemon Mānuka Soda can icon</title>
        <desc id="golden-can-desc">
          Stylised flat-lay illustration of a Golden soda can displaying copy for
          330 millilitres, MGO 83+, Low Cal, Product of Aotearoa, Vitamin C, Lemon
          Mānuka Soda, and a vertical GOLDEN wordmark.
        </desc>

        <g aria-hidden="true">
          <Vector />
          <Vector2 />
          <Vector3 />
          <Vector4 />
          <Vector5 />
          <Vector6 />
          <Vector7 />
          <Vector8 />
        </g>

        <text
          className={styles.copy}
          x="50%"
          textAnchor="middle"
          aria-hidden="true"
        >
          <tspan className={styles.line} dy="-260">
            330 mL
          </tspan>
          <tspan className={styles.line} dy="62">
            MGO 83+
          </tspan>
          <tspan className={styles.line} dy="62">
            Low Cal
          </tspan>
          <tspan className={styles.line} dy="62">
            Product of Aotearoa
          </tspan>
          <tspan className={styles.line} dy="62">
            Vitamin C
          </tspan>
          <tspan className={styles.line} dy="62">
            Lemon Mānuka Soda
          </tspan>
          <tspan className={styles.lemon} dy="62">
            LEMON
          </tspan>
        </text>

        <g className={styles.vertical} aria-hidden="true">
          <N />
          <E />
          <D />
          <L />
          <O />
          <G />
        </g>
      </svg>

      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
