import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DownOutlined } from '@ant-design/icons';
import {
    faBell,
    faChevronDown,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import {
    GeoAreaIcon,
    GirdIcon,
    ImageIcon,
    RouteIcon,
    VideoIcon,
} from '~/icons';
import { Dropdown, Menu, Space } from 'antd';

const cx = classNames.bind(styles);

const menu = [
    {
        path: '/online',
        id: 1,
        name: 'giám sát',
        icon: null,
        subMenu: [],
    },
    {
        path: '',
        id: 2,
        name: 'xem lại',
        icon: faChevronDown,
        subMenu: [
            {
                path: '/route/review',
                name: 'Lộ trình',
                icon: <RouteIcon />,
            },
            {
                name: 'Hình ảnh',
                icon: <ImageIcon />,
            },
            {
                name: 'Video',
                icon: <VideoIcon />,
            },
        ],
    },
    {
        path: '',
        id: 3,
        name: 'báo cáo',
        icon: null,
        subMenu: [],
    },
    {
        path: '',
        id: 4,
        name: 'quản trị',
        icon: null,
        subMenu: [],
    },
    {
        path: '',
        id: 5,
        name: 'Tính năng',
        icon: faChevronDown,
        subMenu: [
            {
                name: 'Giám sát nhiều phương tiện',
                icon: <GirdIcon />,
            },
            {
                name: 'Vùng địa lý',
                icon: <GeoAreaIcon />,
            },
        ],
    },
];

function Header() {
    const [menuId, setMenuId] = useState();

    return (
        <div
            className={`${cx(
                'wrapper',
            )} flex items-center h-12 pl-4 pr-4 justify-evenly fixed left-0 right-0 top-0 z-1000 bg-white border-b`}
        >
            <div className="flex-1">
                <div className="h-full w-full">
                    <img
                        className="w-1/5"
                        src="https://my.mobicam.vn/static/images/logoHead.png"
                        alt=""
                    />
                </div>
            </div>
            <div className="flex-1 justify-center">
                <ul className={`${cx('')} flex item-center justify-center `}>
                    {menu.map((item) => (
                        <li
                            onClick={() =>
                                setMenuId(menuId !== item.id ? item.id : '')
                            }
                            key={item.id}
                            className={`${cx(
                                'menu-item',
                            )}  relative text-xs rounded-full ml-1 mr-1`}
                        >
                            <Dropdown
                                placement="bottom"
                                overlay={
                                    <Menu style={{ borderRadius: 4 }}>
                                        {item.subMenu &&
                                            item.subMenu.map(
                                                (subItem, index) => (
                                                    <Menu.Item key={index}>
                                                        <Link
                                                            to={subItem.path}
                                                            className="flex items-center"
                                                        >
                                                            {subItem.icon}
                                                            <span className="ml-2">
                                                                {subItem.name}
                                                            </span>
                                                        </Link>
                                                    </Menu.Item>
                                                ),
                                            )}
                                    </Menu>
                                }
                                trigger={['click']}
                            >
                                <Link
                                    to={item.path}
                                    className={`${cx(
                                        '',
                                    )}  p-2 flex items-center justify-center uppercase`}
                                >
                                    <Space>
                                        {item.name}
                                        {item.subMenu.length > 0 && (
                                            <DownOutlined />
                                        )}
                                    </Space>
                                </Link>
                            </Dropdown>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 ">
                <div className="flex items-center justify-end">
                    <button className="rounded-full relative border w-10 h-10">
                        <FontAwesomeIcon icon={faBell} className="text-lg" />
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white p-1 rounded-full text-xs flex">
                            99+
                        </span>
                    </button>
                    <button className="h-10 rounded-full flex items-center ml-6 text-xs border pl-3 pr-3">
                        <div className="rounded-full h-7 w-7 overflow-hidden flex items-center justify-center bg-blue-100 mr-2">
                            <FontAwesomeIcon
                                icon={faUser}
                                className="text-sm"
                            />
                        </div>
                        <span className="mr-2">AHAMOVE</span>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className="-mt-1"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Header;
