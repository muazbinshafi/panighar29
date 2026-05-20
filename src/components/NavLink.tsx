// @ts-nocheck
import { Link } from "react-router-dom";

interface NavLinkProps {
  to: string;
  className?: string | ((props: { isActive: boolean }) => string);
  children: React.ReactNode;
  [key: string]: any;
}

export default function NavLink({ to, className, children, ...props }: NavLinkProps) {
  return (
    <Link to={to} className={typeof className === "function" ? className({ isActive: false }) : className} {...props}>
      {children}
    </Link>
  );
}
