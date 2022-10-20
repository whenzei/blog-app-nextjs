interface LoaderProps {
  show: boolean;
}
export default function Loader({ show }: LoaderProps): JSX.Element | null {
  return show ? <div className="loader"></div> : null;
}
