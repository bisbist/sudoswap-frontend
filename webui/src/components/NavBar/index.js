import React from 'react';
import {
  Nav,
  NavLink,
  Bars,
  NavMenu,
} from './NavBarElements';
  
const Navbar = () => {
  return (
    <>
      <Nav>
        <Bars />
  
        <NavMenu>
          <NavLink to='/swap' activeStyle>
            Swap
          </NavLink>
          <NavLink to='/Pools' activeStyle>
            Pools
          </NavLink>
        </NavMenu>
      </Nav>
    </>
  );
};
  
export default Navbar;