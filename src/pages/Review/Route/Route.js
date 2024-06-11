import {
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faFile,
    faMagnifyingGlass,
    faMinus,
    faPlay,
    faPlus,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Polyline } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import { getTrackList } from '~/services/carService';
import styles from './Route.module.scss';
import classNames from 'classnames/bind';
import { Car } from '~/components/Car';
import { EmptyIcon, RatioIcon, SettingIcon } from '~/icons';

const cx = classNames.bind(styles);

function Route() {
    const [waypoints, setWaypoints] = useState();
    const [data, setData] = useState();
    const [tabActive, setTabActive] = useState(null);
    const [properties, setProperties] = useState();
    const [pointRoute, setPointRoute] = useState(0);
    const [play, setPlay] = useState(false);
    const [speed, setSpeed] = useState(16);
    const line = useRef();
    const tabFirst = useRef();

    useEffect(() => {
        if (data) {
            setProperties({
                lat: data[pointRoute]?.lat,
                lng: data[pointRoute]?.lng,
                dir: data[pointRoute]?.direction + 90,
                speed: data[pointRoute]?.speed,
                accIO: data[pointRoute]?.ac,
                name: 'TRUYEN VAO',
            });
        }
    }, [data, pointRoute]);

    useEffect(() => {
        if (data) {
            const interval = setInterval(() => {
                setPointRoute((prevPointRoute) => {
                    return prevPointRoute + 1 < data.length
                        ? prevPointRoute + 1
                        : prevPointRoute;
                });
            }, 1000 / speed);

            return () => clearInterval(interval);
        }
    }, [data, speed]);

    useEffect(() => {
        const fetchWaypoints = async () => {
            try {
                const res = await getTrackList();
                setData(res?.data);
                setWaypoints(res?.data?.map((point) => [point.lat, point.lng]));
            } catch (error) {
                console.error('Error fetching waypoints:', error);
            }
        };
        fetchWaypoints();
    }, []);

    useEffect(() => {
        if (tabActive && line.current) {
            console.log(tabActive.getAttribute('data-node-key'));
            const { offsetWidth, offsetLeft } = tabActive;
            line.current.style.width = `${offsetWidth}px`;
            line.current.style.transform = `translateX(${offsetLeft}px)`;
        }
    }, [tabActive]);

    useEffect(() => {
        if (tabFirst.current) {
            setTabActive(tabFirst.current);
        }
    }, [tabFirst]);

    return (
        <div className="h-full">
            <div className="h-full flex pt-12">
                {/* left */}
                <div className="w-[370px] bg-white shadow h-full pl-1 pr-1">
                    <div className="flex flex-col h-full">
                        <div className="h-24 pt-1">
                            <div className="border">
                                <div className="p-2 w-3/4 border mr-1 relative">
                                    <input
                                        className="outline-none border-none bg-transparent pl-3 text-sm w-full"
                                        placeholder="Chọn phương tiện"
                                    />
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <div className="p-2 w-8/12 border mr-1 relative">
                                    <input
                                        className="outline-none border-none bg-transparent pl-3 text-sm w-full"
                                        placeholder="Chọn phương tiện"
                                    />
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    />
                                </div>
                                <button className="flex items-center h-[38px] text-white text-xs rounded bg-blue-500 p-2 flex-1 justify-center border-none">
                                    <FontAwesomeIcon
                                        icon={faMagnifyingGlass}
                                        className="mr-2"
                                    />
                                    Tìm kiếm
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="flex-1">
                                <div
                                    className={`${cx(
                                        'btn-show',
                                    )} flex items-center text-sm p-2 pt-2 pb-2 cursor-pointer border`}
                                >
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className="mr-2"
                                    />
                                    <span>Lộ trình</span>
                                </div>
                                <div className="border flex-1 border-t-0">
                                    <div className="w-full h-[300px] flex justify-center items-center">
                                        <div>
                                            <div>
                                                <EmptyIcon />
                                            </div>
                                            <p className="text-center mt-2 text-sm">
                                                Trống
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[214px] flex flex-col">
                                <div
                                    className={`${cx(
                                        'btn-show',
                                    )} flex items-center text-sm p-2 pt-2 pb-2 cursor-pointer border `}
                                >
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className="mr-2"
                                    />
                                    <span>Tổng hợp</span>
                                </div>
                                <div className="border border-t-0 flex-1 flex justify-center items-center">
                                    <div>
                                        <div>
                                            <EmptyIcon />
                                        </div>
                                        <p className="text-center mt-2 text-sm">
                                            Trống
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* right */}
                <div className="flex-1 flex relative">
                    {/* Main */}
                    {waypoints && data && properties && (
                        <div className="w-full">
                            <MapContainer
                                center={
                                    waypoints && [
                                        waypoints[0][0],
                                        waypoints[0][1],
                                    ]
                                }
                                zoom={13}
                                scrollWheelZoom={true}
                                zoomControl={false}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <ReactLeafletGoogleLayer
                                    apiKey="AIzaSyA8A9yPeigR3I485ayAHKniugLw3OqXlS4"
                                    type={'satellite'}
                                />
                                <Polyline
                                    positions={waypoints}
                                    color="#cae84a"
                                    weight={6}
                                />
                                <Car data={properties} />
                            </MapContainer>
                        </div>
                    )}
                    <div className="absolute z-1000 bg-white bottom-0 h-60 right-0 w-full text-sm">
                        <div>
                            {/* Header */}
                            <div className="flex items-center justify-between border-b p-1">
                                <div className="flex items-center text-sm relative">
                                    <div
                                        data-node-key={1}
                                        ref={tabFirst}
                                        onClick={(e) =>
                                            setTabActive(e.currentTarget)
                                        }
                                        className={`${
                                            Number(
                                                tabActive?.getAttribute(
                                                    'data-node-key',
                                                ),
                                            ) === 1 && 'text-blue-500'
                                        } mr-7 cursor-pointer`}
                                    >
                                        <span>Dữ liệu lộ trình</span>
                                    </div>
                                    <div
                                        data-node-key={2}
                                        onClick={(e) =>
                                            setTabActive(e.currentTarget)
                                        }
                                        className={`${
                                            Number(
                                                tabActive?.getAttribute(
                                                    'data-node-key',
                                                ),
                                            ) === 2 && 'text-blue-500'
                                        } mr-7 cursor-pointer`}
                                    >
                                        <span>Dừng/đổ</span>
                                    </div>
                                    <div
                                        data-node-key={3}
                                        onClick={(e) =>
                                            setTabActive(e.currentTarget)
                                        }
                                        className={`${
                                            Number(
                                                tabActive?.getAttribute(
                                                    'data-node-key',
                                                ),
                                            ) === 3 && 'text-blue-500'
                                        } mr-7 cursor-pointer`}
                                    >
                                        <span>Vận tốc</span>
                                    </div>
                                    <div
                                        data-node-key={4}
                                        onClick={(e) =>
                                            setTabActive(e.currentTarget)
                                        }
                                        className={`${
                                            Number(
                                                tabActive?.getAttribute(
                                                    'data-node-key',
                                                ),
                                            ) === 4 && 'text-blue-500'
                                        } mr-7 cursor-pointer`}
                                    >
                                        <span>Thống kê</span>
                                    </div>
                                    <span
                                        ref={line}
                                        className={`${cx('line')}`}
                                    ></span>
                                </div>
                                <button className="rounded bg-red-400 w-7 h-7 text-white">
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                            {/* Body */}
                            <div>
                                <div
                                    className={`${cx(
                                        'bg',
                                    )} flex justify-between items-center p-1 pl-2 pr-2`}
                                >
                                    <div className="flex items-center ">
                                        <div className="mr-3">
                                            <span>Tổng {data?.length}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <button className="text-xs mr-2 ml-2">
                                                <FontAwesomeIcon
                                                    icon={faChevronLeft}
                                                />
                                            </button>
                                            <span>1</span>
                                            <button className="text-xs mr-2 ml-2">
                                                <FontAwesomeIcon
                                                    icon={faChevronRight}
                                                />
                                            </button>
                                        </div>
                                        <div className="border"></div>
                                    </div>
                                    <div className="flex items-center">
                                        <button className="rounded p-2 bg-blue-500 text-white text-xs pl-3 pr-3">
                                            <FontAwesomeIcon
                                                icon={faFile}
                                                className="mr-2"
                                            />
                                            <span>Excel</span>
                                        </button>
                                        <button className="ml-1 bg-white p-1 rounded">
                                            <RatioIcon />
                                        </button>
                                        <button className="ml-1 bg-white p-1 rounded">
                                            <SettingIcon />
                                        </button>
                                    </div>
                                </div>
                                {/* table */}
                                <div class="h-full overflow-clip flex flex-col">
                                    <table class={`${cx('bg')} w-full table-fixed`}>
                                        <thead class="sticky top-0">
                                            <tr>
                                                <th className="border">STT</th>
                                                <th className="border">
                                                    Thời gian thiết bị
                                                </th>
                                                <th className="border">
                                                    Tốc độ
                                                </th>
                                                <th className="border">
                                                    Tọa độ
                                                </th>
                                                <th className="border">
                                                    Trạng thái
                                                </th>
                                                <th className="border">KM</th>
                                            </tr>
                                        </thead>
                                    </table>
                                    <div class="flex-1 overflow-y-scroll -mr-3.5 max-h-20">
                                        <table class="w-full table-fixed">
                                            <tbody>
                                                <tr>
                                                    <td className="border pl-2">
                                                        1
                                                    </td>
                                                    <td className="border pl-2">
                                                        2024/06/11 00:00:17
                                                    </td>
                                                    <td className="border pl-2">
                                                        0 km/h
                                                    </td>
                                                    <td className="border pl-2">
                                                        10.756321,106.571404
                                                    </td>
                                                    <td className="border pl-2">
                                                        Đang dừng
                                                    </td>
                                                    <td className="border pl-2">
                                                        0
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border pl-2">
                                                        1
                                                    </td>
                                                    <td className="border pl-2">
                                                        2024/06/11 00:00:17
                                                    </td>
                                                    <td className="border pl-2">
                                                        0 km/h
                                                    </td>
                                                    <td className="border pl-2">
                                                        10.756321,106.571404
                                                    </td>
                                                    <td className="border pl-2">
                                                        Đang dừng
                                                    </td>
                                                    <td className="border pl-2">
                                                        0
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border pl-2">
                                                        1
                                                    </td>
                                                    <td className="border pl-2">
                                                        2024/06/11 00:00:17
                                                    </td>
                                                    <td className="border pl-2">
                                                        0 km/h
                                                    </td>
                                                    <td className="border pl-2">
                                                        10.756321,106.571404
                                                    </td>
                                                    <td className="border pl-2">
                                                        Đang dừng
                                                    </td>
                                                    <td className="border pl-2">
                                                        0
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border pl-2">
                                                        1
                                                    </td>
                                                    <td className="border pl-2">
                                                        2024/06/11 00:00:17
                                                    </td>
                                                    <td className="border pl-2">
                                                        0 km/h
                                                    </td>
                                                    <td className="border pl-2">
                                                        10.756321,106.571404
                                                    </td>
                                                    <td className="border pl-2">
                                                        Đang dừng
                                                    </td>
                                                    <td className="border pl-2">
                                                        0
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border pl-2">
                                                        1
                                                    </td>
                                                    <td className="border pl-2">
                                                        2024/06/11 00:00:17
                                                    </td>
                                                    <td className="border pl-2">
                                                        0 km/h
                                                    </td>
                                                    <td className="border pl-2">
                                                        10.756321,106.571404
                                                    </td>
                                                    <td className="border pl-2">
                                                        Đang dừng
                                                    </td>
                                                    <td className="border pl-2">
                                                        0
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border pl-2">
                                                        1
                                                    </td>
                                                    <td className="border pl-2">
                                                        2024/06/11 00:00:17
                                                    </td>
                                                    <td className="border pl-2">
                                                        0 km/h
                                                    </td>
                                                    <td className="border pl-2">
                                                        10.756321,106.571404
                                                    </td>
                                                    <td className="border pl-2">
                                                        Đang dừng
                                                    </td>
                                                    <td className="border pl-2">
                                                        0
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="h-10 absolute bottom-0 right-0 left-0 w-full bg-white border">
                            <div className="flex w-full items-center h-full">
                                <div>
                                    <button>
                                        <FontAwesomeIcon icon={faPlay} />
                                    </button>
                                    <button className="border">4x</button>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <button>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button>
                                        <FontAwesomeIcon icon={faMinus} />
                                    </button>
                                    <button>
                                        <SettingIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Route;
