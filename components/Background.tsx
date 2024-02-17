import Image from "next/image";
import bitcoinRight from "@/public/bitcoinRight.png"
import blurCoinRight from "@/public/blurCoinRight.svg"
import smallCoinLeft from "@/public/smallCoinLeft.png"
import bitcoinLeft from "@/public/bitcoinLeft.png"
import coinLeft from "@/public/coinLeft.png"
import downCoin from "@/public/downCoin.png"

export function Background() {
  return (
    <>
      <div style={{
        position: 'absolute',
        width: '1082px',
        height: '530.9px',
        right: '50%',
        top: '103px',
        margin: '0 -541px 0 0',
        background: 'radial-gradient(50% 50% at 50% 50%, #3144EF 71.39%, #3D0DFF 81.49%)',
        borderRadius: '50%',
        filter: 'blur(152.923px)',
        transform: 'matrix(-1, 0, 0, 1, 0, 0)',
        zIndex: '-1'
      }}>
      </div>
      <div style={{
        position: 'absolute',
        width: '548.12px',
        height: '275.32px',
        right: '35%',
        top: '176.34px',
        borderRadius: '50%',
        background: '#FFFFFF',
        transform: 'matrix(-0.97, 0.26, 0.26, 0.97, 0, 0)',
        filter: 'blur(116.495px)',
        zIndex: '-1'
      }}>
      </div>
      <div style={{
        position: 'absolute',
        width: '313.06px',
        height: '157.25px',
        right: '52%',
        top: '389.85px',
        borderRadius: '50%',
        background: '#FFFFFF',
        transform: 'matrix(-0.97, 0.26, 0.26, 0.97, 0, 0)',
        filter: 'blur(59.1959px)',
        zIndex: '-1'
      }}>
      </div>
      <Image
        src={bitcoinRight}
        alt=""
        width={159.42}
        height={185.29}
        priority
        className="w-auto absolute right-0 top-[165.12px]" />
      <Image
        src={blurCoinRight}
        alt=""
        width={100}
        height={200}
        priority
        className="w-auto absolute right-[33.88px] top-[601.04px]" />
      <Image
        src={smallCoinLeft}
        alt=""
        width={80}
        priority
        className="absolute left-0 top-[261px]" />
      <Image
        src={coinLeft}
        alt=""
        width={51.3}
        height={79.5}
        priority
        className="absolute left-[70px] top-[639px]" />
      <Image
        src={bitcoinLeft}
        alt=""
        width={250}
        height={355}
        priority
        className="w-auto absolute left-0 top-[335px]" />
      <Image
        src={downCoin}
        alt=""
        width={264}
        priority
        className="absolute left-[279px] bottom-0" />
    </>
  );
}