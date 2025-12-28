import Image from 'next/image';

type LogoProps = {
  className?: string;
  size?: number;
};

const Logo = ({ className, size = 64 }: LogoProps) => (
  <Image
    src="/imagenes/logo_XXXV_aniversario_festivo.png"
    alt="NovaMvsica 35th anniversary festive logo"
    width={size}
    height={size}
    className={className}
    priority
  />
);

export default Logo;
