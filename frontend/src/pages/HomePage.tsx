import HeroCarousel from '../components/HeroCarousel';
import DestinationSearch from '../components/DestinationSearch';
import ExploreDestinations from '../components/ExploreDestinations';
import LocalAttractions from '../components/LocalAttractions';
import FeaturedPackages from '../components/FeaturedPackages';
import PackageBuilder from '../components/PackageBuilder';
import GuestReviews from '../components/GuestReviews';
import MeetTeam from '../components/MeetTeam';
import TravelStories from '../components/TravelStories';
import FollowJourney from '../components/FollowJourney';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <main>
      <HeroCarousel />
      <DestinationSearch />
      <div id="destinations">
        <ExploreDestinations />
      </div>
      <div id="attractions">
        <LocalAttractions />
      </div>
      <div id="packages">
        <FeaturedPackages />
      </div>
      <PackageBuilder />
      <GuestReviews />
      <MeetTeam />
      <div id="stories">
        <TravelStories />
      </div>
      <FollowJourney />
      <Newsletter />
      <Footer />
    </main>
  );
}
