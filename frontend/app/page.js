import { Home, ImageNavbar } from "./components/Home"

export default function page() {
  return (
      <div className="ml-20 mr-20">
        <Home />
        <ImageNavbar imageName="My Image Name" />
      </div>
  );
}
