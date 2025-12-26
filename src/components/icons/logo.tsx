import Image from 'next/image';

type LogoProps = {
  className?: string;
  size?: number;
};

const Logo = ({ className, size = 64 }: LogoProps) => (
  <Image
    src="/logo.png"
    alt="NovaMvsica logo"
    width={size}
    height={size}
    className={className}
    priority
  />
);

export default Logo;
