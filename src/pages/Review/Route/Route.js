import {
    faFile,
    faMinus,
    faPause,
    faPlay,
    faPlus,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Polyline, useMap } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import { getListVehicles, getTrackList } from '~/services/carService';
import styles from './Route.module.scss';
import classNames from 'classnames/bind';
import { Car } from '~/components/Car';
import { RatioIcon, SettingIcon } from '~/icons';
import dayjs from 'dayjs';
import {
    Button,
    Collapse,
    DatePicker,
    Empty,
    Pagination,
    Select,
    Space,
    Table,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { RouteCar } from '~/components/RouteCar';
const { RangePicker } = DatePicker;

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

const cx = classNames.bind(styles);

const SetMapCenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center]);
    return null;
};

function Route() {
    const [waypoints, setWaypoints] = useState();
    const [data, setData] = useState();
    const [mLvehi, setMLvehi] = useState();
    const [tabActive, setTabActive] = useState(null);
    const [properties, setProperties] = useState();
    const [pointRoute, setPointRoute] = useState(0);
    const [play, setPlay] = useState(false);
    const [speed, setSpeed] = useState(4);
    const line = useRef();
    const tabFirst = useRef();
    const rangeRef = useRef();
    const [page, setPage] = useState(0);
    const [maxPage, setMaxPage] = useState(50);
    // pointRouteRef là một tham chiếu giữ giá trị hiện tại của pointRoute
    const pointRouteRef = useRef(pointRoute);
    const [center, setCenter] = useState();

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        setPointRoute(value);
        pointRouteRef.current = value;
    };

    const convertDataSourceTable = (data) => {
        return data?.map((item, index) => ({
            key: index,
            no: maxPage * page + index + 1,
            time: item.timeT,
            speed: item.speed,
            coordinates: `${item.lat}, ${item.lng}`,
            state: `${item.speed > 0 ? 'Đang chạy' : 'Đang dừng'}`,
            mileage: item.mileage,
        }));
    };

    const chunkArray = (myArray, chunk_size) => {
        var index = 0;
        var arrayLength = myArray?.length;
        var tempArray = [];

        for (index = 0; index < arrayLength; index += chunk_size) {
            tempArray.push(myArray.slice(index, index + chunk_size));
        }

        return tempArray;
    };

    // const getPageByPointRoute = (pointRoute) => {
    //     const chunks = chunkArray(data, maxPage);
    //     for (let page = 0; page < chunks.length; page++) {
    //         for (let index = 0; index < chunks[page].length; index++) {
    //             if (maxPage * page + index === pointRoute) {
    //                 return page;
    //             }
    //         }
    //     }
    //     return -1;
    // };

    const handleSearch = () => {
        const fetch = async () => {
            try {
                const res = await getTrackList();
                setData(res?.data);
                setWaypoints(res?.data?.map((point) => [point.lat, point.lng]));
                setCenter([res?.data[0].lat, res?.data[0].lng]);
            } catch (error) {
                console.error(error);
            }
        };
        fetch();
    };

    // useEffect(() => {
    //     pointRouteRef.current = pointRoute;
    //     if (getPageByPointRoute(pointRoute) > -1)
    //         setPage(getPageByPointRoute(pointRoute));
    // }, [pointRoute]);

    // useEffect(() => {
    //     if (data) {
    //         setProperties({
    //             lat: data[pointRoute]?.lat,
    //             lng: data[pointRoute]?.lng,
    //             dir: data[pointRoute]?.direction + 90,
    //             speed: data[pointRoute]?.speed,
    //             accIO: data[pointRoute]?.ac,
    //             name: 'TRUYEN VAO',
    //         });
    //     }
    // }, [data, pointRoute]);

    // useEffect(() => {
    //     if (data && play) {
    //         const interval = setInterval(() => {
    //             setPointRoute((prevPointRoute) => {
    //                 const newPointRoute =
    //                     prevPointRoute + 1 < data.length
    //                         ? prevPointRoute + 1
    //                         : prevPointRoute;
    //                 pointRouteRef.current = newPointRoute;
    //                 return newPointRoute;
    //             });
    //         }, 1000 / speed);

    //         return () => clearInterval(interval);
    //     }
    // }, [data, speed, play]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [mLvehiRes] = await Promise.all([getListVehicles()]);
                setMLvehi(mLvehiRes?.data);
                setCenter([mLvehiRes?.data[0].lat, mLvehiRes?.data[0].lng]);
            } catch (error) {
                console.error(error);
            }
        };
        fetch();
    }, []);

    // useEffect(() => {
    //     if (rangeRef) {
    //         const valPercent =
    //             (rangeRef.current.value / rangeRef.current.max) * 100;
    //         rangeRef.current.style.background = `linear-gradient(to right, #3671f6 ${valPercent}%, #cccccc ${valPercent}%)`;
    //     }
    // }, [pointRoute]);

    useEffect(() => {
        if (tabActive && line.current) {
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
                        <div className="h-20 pt-1">
                            <Space direction="vertical" size={12}>
                                <RangePicker
                                    format="YYYY/MM/DD HH:mm"
                                    defaultValue={[
                                        dayjs().startOf('day'),
                                        dayjs().endOf('day'),
                                    ]}
                                    placeholder={[
                                        'Ngày bắt đầu',
                                        'Ngày kết thúc',
                                    ]}
                                    style={{ borderRadius: 0 }}
                                    showTime
                                />
                            </Space>
                            <div className="flex items-center justify-between mt-1">
                                <div className="w-8/12 mr-1 relative">
                                    <Select
                                        showSearch
                                        style={{
                                            borderRadius: 2,
                                            width: '100%',
                                        }}
                                        placeholder="Chọn phương tiện"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').includes(
                                                input,
                                            )
                                        }
                                        filterSort={(optionA, optionB) =>
                                            (optionA?.label ?? '')
                                                .toLowerCase()
                                                .localeCompare(
                                                    (
                                                        optionB?.label ?? ''
                                                    ).toLowerCase(),
                                                )
                                        }
                                        options={mLvehi?.map((v) => {
                                            return {
                                                value: `${v.name_Vid}|${v.devId}`,
                                                label: `${v.name_Vid} (${v.name_Vid}) (${v.devId})`,
                                            };
                                        })}
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    type="primary"
                                    className="flex-1"
                                    style={{ borderRadius: 2 }}
                                    icon={<SearchOutlined />}
                                >
                                    Tìm kiếm
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 bg-gray">
                            <div className="flex-1">
                                <Collapse
                                    style={{ borderRadius: 0 }}
                                    defaultActiveKey={1}
                                    items={[
                                        {
                                            key: '1',
                                            label: 'Lộ trình',
                                            children: (
                                                <Empty
                                                    description="Trống"
                                                    image={
                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                    }
                                                />
                                            ),
                                        },
                                    ]}
                                />
                            </div>
                            <div className="h-[214px] flex flex-col">
                                <Collapse
                                    style={{ borderRadius: 0 }}
                                    defaultActiveKey={1}
                                    items={[
                                        {
                                            key: '1',
                                            label: 'Tổng hợp',
                                            children: (
                                                <Empty
                                                    description="Trống"
                                                    image={
                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                    }
                                                />
                                            ),
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* right */}
                <div className="flex-1 flex relative">
                    {/* Main */}
                    {mLvehi && (
                        <div className="w-full">
                            <MapContainer
                                center={
                                    mLvehi && [mLvehi[0].lat, mLvehi[0].lng]
                                }
                                zoom={13}
                                scrollWheelZoom={true}
                                zoomControl={false}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <SetMapCenter center={center} />
                                <ReactLeafletGoogleLayer
                                    apiKey="AIzaSyA8A9yPeigR3I485ayAHKniugLw3OqXlS4"
                                    type={'satellite'}
                                />
                                {waypoints && data && (
                                    <>
                                        <Polyline
                                            positions={waypoints}
                                            color="#cae84a"
                                            weight={6}
                                        />
                                        <RouteCar
                                            data={data}
                                            maxPage={maxPage}
                                            rangeRef={rangeRef}
                                            play={play}
                                            speed={speed}
                                            setPage={setPage}
                                            pointRoute={pointRoute}
                                            pointRouteRef={pointRouteRef}
                                        />
                                        {/* <Car data={properties} /> */}
                                    </>
                                )}
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
                                    <Pagination
                                        locale={{ items_per_page: '/ trang' }}
                                        size="small"
                                        total={data ? data.length - 1 : 1}
                                        showTotal={(total) => `Tổng ${total}`}
                                        defaultPageSize={50}
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
                                <div>
                                    <Table
                                        size="small"
                                        fixed={true}
                                        columns={columns}
                                        dataSource={convertDataSourceTable(
                                            chunkArray(data, maxPage)[page],
                                        )}
                                        bordered
                                        pagination={false}
                                        scroll={{
                                            y: 80,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
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
                                        options={[
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
                                        ]}
                                    />
                                </div>
                                <div className="flex-1 mr-4">
                                    <input
                                        ref={rangeRef}
                                        value={rangeRef?.current?.value}
                                        type="range"
                                        min={0}
                                        max={data && data?.length - 1}
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
                </div>
            </div>
        </div>
    );
}

export default Route;
