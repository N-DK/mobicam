import { useEffect, useMemo, useRef, useState } from 'react';
import { Car } from '../Car';
import { chunkArray } from '~/utils';
import ReactDOM from 'react-dom';
import {
    AddressIcon,
    GPSIcon,
    LocationIcon,
    RouteIcon,
    SpeedIcon,
} from '~/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
    faChartLine,
    faFile,
    faMinus,
    faPause,
    faPlay,
    faPlus,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { RatioIcon, SettingIcon } from '~/icons';
import { Button, Select, Pagination, Slider, Spin, Table } from 'antd';
import styles from './RouteCar.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const columns = [
    {
        title: 'STT',
        dataIndex: 'no',
    },
    {
        title: 'Thời gian thiết bị',
        dataIndex: 'time',
    },
    {
        title: 'Tốc độ',
        dataIndex: 'speed',
    },
    {
        title: 'Toạ độ',
        dataIndex: 'coordinates',
        render: (text) => <a>{text}</a>,
    },
    {
        title: 'Trạng thái',
        dataIndex: 'state',
    },
    {
        title: 'KM',
        dataIndex: 'mileage',
    },
];

const speeds = [
    {
        value: '1',
        label: '1x',
    },
    {
        value: '2',
        label: '2x',
    },
    {
        value: '4',
        label: '4x',
    },
    {
        value: '8',
        label: '8x',
    },
    {
        value: '16',
        label: '16x',
    },
];

const tabs = [
    { key: 1, name: 'Dữ liệu lộ trình' },
    { key: 2, name: 'Dừng/đỗ' },
    { key: 3, name: 'Vận tốc' },
    { key: 4, name: 'Thống kê' },
];

const Portal = ({ children }) => {
    const portalRoot = document.getElementById('portal-root');
    return ReactDOM.createPortal(children, portalRoot);
};

const DetailPortal = ({ children }) => {
    const portalRoot = document.getElementById('detail-portal-root');
    return ReactDOM.createPortal(children, portalRoot);
};

function RouteCar({ props }) {
    const { data, pointRoute, pointRouteRef, loading } = props;
    const [point, setPoint] = useState(pointRoute);
    const [properties, setProperties] = useState();
    const tabFirst = useRef(null);
    const [tabActive, setTabActive] = useState(null);
    const [page, setPage] = useState(0);
    const [speed, setSpeed] = useState(4);
    const [maxPage, setMaxPage] = useState(50);
    const [play, setPlay] = useState(false);
    const line = useRef();
    const [toggleDetails, setToggleDetails] = useState(true);
    const [tableComponent, setTableComponent] = useState(null);

    const handleInputChange = (newValue) => {
        const value = parseInt(newValue);
        setPoint(value);
        pointRouteRef.current = value;
    };

    const convertDataSourceTable = (arr) => {
        return arr?.map((item, index) => {
            return {
                key: index,
                no: maxPage * page + index + 1,
                time: item.timeT,
                speed: `${item.speed} km/h`,
                coordinates: `${item.lat}, ${item.lng}`,
                state: `${item.speed > 0 ? 'Đang chạy' : 'Đang dừng'}`,
                mileage: item.mileage.toFixed(2),
            };
        });
    };

    const dataSource = useMemo(() => {
        const chunkedData = chunkArray(data, maxPage);
        return convertDataSourceTable(chunkedData[page]);
    }, [data, maxPage, page]);

    const getPageByPointRoute = (pointRoute) => {
        const chunks = chunkArray(data, maxPage);
        for (let page = 0; page < chunks.length; page++) {
            for (let index = 0; index < chunks[page].length; index++) {
                if (maxPage * page + index === pointRoute) {
                    return page;
                }
            }
        }
        return -1;
    };

    useEffect(() => {
        setPoint(pointRouteRef.current);
        if (pointRouteRef.current === 0) setPlay(false);
    }, [pointRouteRef.current]);

    useEffect(() => {
        pointRouteRef.current = point;
        if (getPageByPointRoute(point) > -1)
            setPage(getPageByPointRoute(point));
    }, [point]);

    useEffect(() => {
        if (data) {
            setProperties({
                lat: data[point]?.lat,
                lng: data[point]?.lng,
                dir: data[point]?.direction + 90,
                speed: data[point]?.speed,
                accIO: data[point]?.ac,
                name: 'TRUYEN VAO',
            });
        }
    }, [data, point]);

    useEffect(() => {
        if (tabFirst.current) {
            setTabActive(tabFirst.current);
        }
    }, [tabFirst]);

    useEffect(() => {
        if (data && play) {
            const interval = setInterval(() => {
                setPoint((prevPointRoute) => {
                    if (prevPointRoute + 1 >= data.length) setPlay(false);
                    const newPointRoute =
                        prevPointRoute + 1 < data.length
                            ? prevPointRoute + 1
                            : prevPointRoute;
                    pointRouteRef.current = newPointRoute;
                    return newPointRoute;
                });
            }, 1000 / speed);

            return () => clearInterval(interval);
        }
    }, [data, speed, play]);

    useEffect(() => {
        if (tabActive && line.current) {
            const { offsetWidth, offsetLeft } = tabActive;
            line.current.style.width = `${offsetWidth}px`;
            line.current.style.transform = `translateX(${offsetLeft}px)`;
        }
    }, [tabActive]);

    useEffect(() => {
        const table = (
            <Table
                virtualized
                size="small"
                fixed={true}
                columns={columns}
                dataSource={dataSource}
                bordered
                pagination={false}
                scroll={{ y: 136 }}
            />
        );
        setTableComponent(table);
    }, [dataSource, columns]);

    return (
        <div>
            {properties && (
                <>
                    <Car data={properties} />
                    <Portal>
                        <div>
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className=" top-2 absolute right-2 w-[220px] text-[12px] bg-white z-[10000] rounded shadow-lg px-2 py-2"
                            >
                                <div className="font-semibold border-b pb-1 pt-1">
                                    <p>Thông tin thiết bị</p>
                                </div>
                                <div className="pt-2">
                                    <div className="bg-slate-200 rounded p-2 font-semibold mb-1">
                                        {/* {device?.split('|')[0]} - Xe tải các loại */}
                                        Xe tải các loại
                                    </div>
                                    <div className="flex items-center pt-2 pb-2">
                                        <FontAwesomeIcon
                                            icon={faClock}
                                            fontSize={18}
                                        />
                                        <span className="font-semibold ml-2">
                                            {data[pointRouteRef.current]?.timeT}
                                        </span>
                                    </div>
                                    <div className="flex items-center pt-2 pb-2">
                                        <SpeedIcon />
                                        <span
                                            className={`font-semibold ml-2 ${
                                                data[pointRouteRef.current]
                                                    ?.speed > 0
                                                    ? 'text-[#00aa9a]'
                                                    : 'text-[#e74b3c]'
                                            }`}
                                        >
                                            {data[pointRouteRef.current]?.speed}{' '}
                                            km/h
                                        </span>
                                    </div>
                                    <div className="flex items-center pt-2 pb-2">
                                        <GPSIcon />
                                        <span className="font-semibold ml-2">
                                            GPS tốt
                                        </span>
                                    </div>
                                    <div className="flex items-center pt-2 pb-2">
                                        <LocationIcon />
                                        <span className="font-semibold ml-2">
                                            {`${
                                                data[pointRouteRef.current]?.lat
                                            }, ${
                                                data[pointRouteRef.current]?.lng
                                            }`}
                                        </span>
                                    </div>
                                    <div className="flex items-center pt-2 pb-2">
                                        <AddressIcon />
                                        <span className="font-semibold ml-2">
                                            -
                                        </span>
                                    </div>
                                    <div className="flex items-center pt-2 pb-2">
                                        <RouteIcon />
                                        <span className="font-semibold ml-2">
                                            {`${data[
                                                pointRouteRef.current
                                            ]?.mileage.toFixed(2)} km`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Portal>
                </>
            )}
            <DetailPortal>
                <div
                    className={`absolute z-1000 bg-white bottom-0 ${
                        toggleDetails ? 'h-[280px]' : 'h-10'
                    } right-0 w-full text-sm transition-all`}
                >
                    {loading ? (
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white-opacity-main  bg-opacity-70 flex justify-center items-center z-[9999999]">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div>
                            {/* Header */}
                            <div className="flex items-center justify-between border-b p-1">
                                <div className="flex items-center text-sm relative">
                                    {tabs.map((tab) => (
                                        <div
                                            key={tab.key}
                                            data-node-key={tab.key}
                                            ref={
                                                tab.key === 1 ? tabFirst : null
                                            }
                                            onClick={(e) =>
                                                setTabActive(e.currentTarget)
                                            }
                                            className={`${
                                                Number(
                                                    tabActive?.getAttribute(
                                                        'data-node-key',
                                                    ),
                                                ) === tab.key && 'text-blue-500'
                                            } mr-7 cursor-pointer text-xxs`}
                                        >
                                            <span>{tab.name}</span>
                                        </div>
                                    ))}
                                    <span
                                        ref={line}
                                        className={`${cx('line')}`}
                                    ></span>
                                </div>
                                <button
                                    onClick={() => setToggleDetails(false)}
                                    className="rounded bg-red-400 w-7 h-7 text-white"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                            {/* Body */}
                            <div>
                                <div
                                    className={`${cx(
                                        'bg',
                                    )} flex justify-between items-center h-9 pl-2 pr-2 text-xxs`}
                                >
                                    <Pagination
                                        className="text-xxs"
                                        locale={{
                                            items_per_page: '/ trang',
                                        }}
                                        size="small"
                                        total={data ? data.length : 0}
                                        showTotal={(total) => `Tổng ${total}`}
                                        showSizeChanger
                                        defaultPageSize={maxPage}
                                        current={page + 1}
                                        defaultCurrent={1}
                                        onChange={(pageNumber) =>
                                            setPage(pageNumber - 1)
                                        }
                                        onShowSizeChange={(current, size) =>
                                            setMaxPage(size)
                                        }
                                    />
                                    <div className="flex items-center">
                                        <Button className="rounded p-2 bg-blue-500 text-white text-xs pl-3 pr-3">
                                            <FontAwesomeIcon icon={faFile} />
                                            <span>Excel</span>
                                        </Button>
                                        <button className="ml-1 bg-white p-1 rounded">
                                            <RatioIcon />
                                        </button>
                                        <button className="ml-1 bg-white p-1 rounded">
                                            <SettingIcon />
                                        </button>
                                    </div>
                                </div>
                                {/* table */}
                                <div>{tableComponent}</div>
                            </div>
                        </div>
                    )}
                    {!toggleDetails && (
                        <Button
                            onClick={() => setToggleDetails(true)}
                            className="rounded-sm p-2 bg-[#3671f6] border-none text-white text-xs pl-3 pr-3 absolute bottom-12 left-4"
                        >
                            <FontAwesomeIcon icon={faChartLine} />
                            Xem chi tiết
                        </Button>
                    )}
                    {/* Footer */}
                    <div className="h-10 absolute bottom-0 right-0 left-0 w-full bg-white border pl-3 pr-3">
                        <div className="flex w-full items-center h-full">
                            <div className="mr-2">
                                <button
                                    onClick={() => setPlay(!play)}
                                    className="border w-8 h-8 mr-2"
                                >
                                    <FontAwesomeIcon
                                        icon={play ? faPause : faPlay}
                                    />
                                </button>
                                <Select
                                    defaultValue={`${speed}`}
                                    style={{
                                        width: 80,
                                    }}
                                    onChange={(value) => {
                                        setSpeed(Number(value));
                                    }}
                                    options={speeds}
                                />
                            </div>
                            <div className="flex-1 mr-4">
                                <Slider
                                    min={0}
                                    max={data && data?.length - 1}
                                    value={pointRouteRef?.current}
                                    className="w-full"
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex items-center">
                                <button className="w-8 h-8 border mr-2">
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                                <button className="w-8 h-8 border mr-2">
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>
                                <button className="w-8 h-8 border flex items-center justify-center">
                                    <SettingIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DetailPortal>
        </div>
    );
}

export default RouteCar;
