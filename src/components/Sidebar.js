import { NavLink } from "react-router-dom";
import "./Sidebar.css";

/**
 * Component to display sidebar links.
 **/
/*function Sidebar({ items}) {
  return (
    <div className="sidebar-container sidbar-top-padding">
      <div className="sidebar">
        {items.map(({ label, id, route, disabled }) => (
            <NavLink to={route} key={id} className={({ isActive }) => (isActive ? 'active' : '')}>
                <ul className="sidebar-item">
                    <li className={disabled === true ? "" : "sidebar-item-text"}>{label}</li>
                </ul>
            </NavLink>
        ))}
      </div>
    </div>
  );
}*/

function Sidebar({ items }) {
  return (
    <div className="sidebar-container sidbar-top-padding">
      <div className="sidebar">
        {items.map(({ label, id, route, disabled }) =>
          disabled ? (
            <ul className="sidebar-item disabled">
              <li className="sidebar-item-text">
                {label}
                <span className="coming-soon"> (Coming Soon!)</span>
              </li>
            </ul>
          ) : (
            <NavLink
              to={route}
              key={id}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <ul className="sidebar-item">
                <li className="sidebar-item-text">{label}</li>
              </ul>
            </NavLink>
          )
        )}
      </div>
    </div>
  );
}

export default Sidebar;