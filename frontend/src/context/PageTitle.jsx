import { useEffect } from "react";
import PropTypes from "prop-types";

const PageTitle = ({ title }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Geste`;
    } else {
      document.title = "Geste";
    }
  }, [title]);

  return null; // não renderiza nada no DOM
};

PageTitle.propTypes = {
  title: PropTypes.string, // opcional, se não passar cai no default
};

export default PageTitle;
