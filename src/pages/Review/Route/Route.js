import { useEffect, useRef, useState } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';

import {
    getListVehicles,
    getPackingRp,
    getTrackList,
} from '~/services/carService';
import dayjs from 'dayjs';
import {
    Button,
    Collapse,
    DatePicker,
    Empty,
    Select,
    Space,
    Spin,
    Timeline,
} from 'antd';
import {
    SearchOutlined,
    CarFilled,
    EnvironmentFilled,
} from '@ant-design/icons';
import { RouteCar } from '~/components/RouteCar';
import { formatTime } from '~/utils';
import { TimelineRoute } from '~/components/TImelineRoute';
import { Hotline } from 'react-leaflet-hotline';
import { options } from '~/assets/constants.ts';

const { RangePicker } = DatePicker;

const SetMapCenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

function Route() {
    const [waypoints, setWaypoints] = useState();
    const [data, setData] = useState();
    const [mLvehi, setMLvehi] = useState();
    const [pointRoute, setPointRoute] = useState(0);
    const pointRouteRef = useRef(pointRoute);
    const [center, setCenter] = useState();
    const [device, setDevice] = useState();
    const [loading, setLoading] = useState(false);
    const [parkingRp, setPackingRp] = useState();
    const [date, setDate] = useState([
        dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    ]);

    function dateTimeStringToUnixSeconds(dateTimeString, subText) {
        let [datePart, timePart] = dateTimeString.split(' ');
        let [year, month, day] = datePart.split(subText).map(Number);
        let [hours = 0, minutes = 0, seconds = 0] = (timePart || '00:00:00')
            .split(':')
            .map(Number);
        let date = new Date(year, month - 1, day, hours, minutes, seconds);
        let secondsSinceEpoch = date.getTime() / 1000;
        return secondsSinceEpoch;
    }

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (angle) => angle * (Math.PI / 180);

        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    };

    const createStartNEndTime = (dateStrings) => {
        const firstDateTimeParts = dateStrings[0].split(' ');
        const secondDateTimeParts = dateStrings[1].split(' ');

        const startDate = firstDateTimeParts[0].replaceAll('/', '-');
        const endDate = secondDateTimeParts[0].replaceAll('/', '-');
        const startTime = firstDateTimeParts[1] || '00:00:00';
        const endTime = secondDateTimeParts[1] || '23:59:59';

        return {
            startDate,
            endDate,
            startTime,
            endTime,
        };
    };

    const handleSearch = () => {
        const [vid, devId] = device?.split('|');
        const data = {
            ...createStartNEndTime(date),
            company: 1,
            devId,
            vid,
        };

        const payloadPacking = {
            company: 1,
            endTime: dateTimeStringToUnixSeconds(
                `${createStartNEndTime(date)['endDate']} ${
                    createStartNEndTime(date)['endTime']
                }`,
                '-',
            ),
            licencePlate: [vid],
            limit: 0,
            startTime: dateTimeStringToUnixSeconds(
                `${createStartNEndTime(date)['startDate']} ${
                    createStartNEndTime(date)['startTime']
                }`,
                '-',
            ),
        };

        const fetch = async () => {
            try {
                setLoading(true);
                const [res, packingRpRes] = await Promise.all([
                    getTrackList(data),
                    getPackingRp(payloadPacking),
                ]);
                setPackingRp(packingRpRes?.data);
                setData(createMileageForData(res?.data));
                setWaypoints(
                    res?.data?.map((point) => ({
                        lat: point.lat,
                        lng: point.lng,
                        value: point.speed,
                    })),
                );
                setCenter([res?.data[0].lat, res?.data[0].lng]);
                setPointRoute(0);
                pointRouteRef.current = 0;
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };
        fetch();
    };

    const createMileageForData = (arr) => {
        if (arr.length === 0) return arr;

        for (let i = 1; i < arr.length; i++) {
            const prevMileage = arr[i - 1].mileage;
            const distance = haversineDistance(
                arr[i - 1].lat,
                arr[i - 1].lng,
                arr[i].lat,
                arr[i].lng,
            );
            arr[i].mileage = prevMileage + distance;
        }

        return arr;
    };

    const totalFromTo = (startTime, endTime) => {
        var arr = [...data];
        arr = arr.filter(
            (item) => item.time >= startTime && item.time <= endTime,
        );

        return arr[arr.length - 2]?.mileage - arr[0]?.mileage;
    };

    function groupByTotalTime(arr) {
        let results = [];
        let start = {
            item: arr[0],
            total: arr[0]?.total_time,
            startTime: arr[0]?.start_time,
        };
        arr = arr.filter((item) => item.total_time >= 300);
        var cumulativeKilometers = 0;
        for (let i = 0; i < arr.length; i++) {
            if (
                arr[i]?.address === arr[i + 1]?.address ||
                haversineDistance(
                    arr[i]?.start_gps?.split(',')[0],
                    arr[i]?.start_gps?.split(',')[1],
                    arr[i + 1]?.start_gps?.split(',')[0],
                    arr[i + 1]?.start_gps?.split(',')[1],
                ) <= 0.8
            ) {
                start.total += arr[i + 1]?.total_time;
            } else {
                results.push({
                    ...start.item,
                    total_time: start.total,
                    start_time: start.startTime,
                    cumulativeKilometers,
                    end_time: arr[i].end_time,
                });
                const end_time = arr[i + 1]?.start_time
                    ? arr[i + 1]?.start_time
                    : dateTimeStringToUnixSeconds(date[1], '/');
                const start_time = arr[i].end_time;
                results.push({
                    address: `${totalFromTo(start_time, end_time).toFixed(
                        2,
                    )} km di chuyển`,
                    start_time,
                    end_time,
                    total_time: end_time - start_time,
                    state: 'MOVE',
                });
                cumulativeKilometers += totalFromTo(start_time, end_time);
                start = {
                    item: arr[i + 1],
                    total: arr[i + 1]?.total_time,
                    startTime: arr[i + 1]?.start_time,
                };
            }
        }

        return results;
    }

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

    return (
        <div className="h-full ">
            <div className="h-full flex pt-12 relative">
                {/* left */}
                <div className="w-[370px] bg-white shadow h-full pl-1 pr-1">
                    <div className="flex flex-col h-full">
                        <div className="h-20 pt-1">
                            <Space direction="vertical" size={12}>
                                <RangePicker
                                    format="YYYY/MM/DD HH:mm:ss"
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
                                    onChange={(dates, dateStrings) =>
                                        setDate(dateStrings)
                                    }
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
                                        onChange={(value) => setDevice(value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    type="primary"
                                    className="flex-1"
                                    style={{ borderRadius: 2 }}
                                    icon={<SearchOutlined />}
                                    loading={loading}
                                >
                                    Tìm kiếm
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 bg-gray relative">
                            {loading ? (
                                <div className="absolute top-0 left-0 right-0 bottom-0  bg-white-opacity-main  bg-opacity-70 flex justify-center items-center z-[9999999]">
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 h-[500px] overflow-y-auto">
                                        <div className="h-[300px]">
                                            <Collapse
                                                style={{ borderRadius: 0 }}
                                                defaultActiveKey={1}
                                                items={[
                                                    {
                                                        key: '1',
                                                        label: 'Lộ trình',
                                                        children: (
                                                            <>
                                                                {data ? (
                                                                    <Timeline
                                                                        items={groupByTotalTime(
                                                                            parkingRp,
                                                                        )?.map(
                                                                            (
                                                                                data,
                                                                                index,
                                                                            ) => {
                                                                                return {
                                                                                    dot: (
                                                                                        <div
                                                                                            className={`flex w-5 h-5 rounded-sm justify-center ${
                                                                                                data.state
                                                                                                    ? 'bg-[#3671f6]'
                                                                                                    : 'bg-[#e74b3c]'
                                                                                            }  items-center text-white `}
                                                                                        >
                                                                                            <span>
                                                                                                {data.state ? (
                                                                                                    <CarFilled />
                                                                                                ) : (
                                                                                                    <EnvironmentFilled />
                                                                                                )}
                                                                                            </span>
                                                                                        </div>
                                                                                    ),
                                                                                    children:
                                                                                        (
                                                                                            <TimelineRoute
                                                                                                state={
                                                                                                    'STOP'
                                                                                                }
                                                                                                data={
                                                                                                    data
                                                                                                }
                                                                                            />
                                                                                        ),
                                                                                };
                                                                            },
                                                                        )}
                                                                    />
                                                                ) : (
                                                                    <Empty
                                                                        description="Trống"
                                                                        image={
                                                                            Empty.PRESENTED_IMAGE_SIMPLE
                                                                        }
                                                                    />
                                                                )}
                                                            </>
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col bottom-0 right-0 left-0">
                                        <Collapse
                                            accordion={true}
                                            style={{
                                                borderRadius: 0,
                                            }}
                                            defaultActiveKey={1}
                                            items={[
                                                {
                                                    key: '1',
                                                    label: 'Tổng hợp',
                                                    children: (
                                                        <>
                                                            {parkingRp ? (
                                                                <div className="h-full">
                                                                    <p className="flex justify-between items-center">
                                                                        <span>
                                                                            Quãng
                                                                            đường
                                                                            đi
                                                                            được:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {data[
                                                                                data.length -
                                                                                    1
                                                                            ].mileage.toFixed(
                                                                                1,
                                                                            )}
                                                                            km
                                                                        </span>
                                                                    </p>
                                                                    <p className="flex justify-between items-center">
                                                                        <span>
                                                                            Số
                                                                            lần
                                                                            dừng
                                                                            đỗ:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {`${parkingRp.length} lần`}
                                                                        </span>
                                                                    </p>
                                                                    <p className="flex justify-between items-center">
                                                                        <span>
                                                                            Tổng
                                                                            thời
                                                                            gian
                                                                            dừng
                                                                            đỗ:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {formatTime(
                                                                                parkingRp.reduce(
                                                                                    (
                                                                                        acc,
                                                                                        item,
                                                                                    ) =>
                                                                                        acc +
                                                                                        item.total_time,
                                                                                    0,
                                                                                ),
                                                                            )}
                                                                        </span>
                                                                    </p>
                                                                    <p className="flex justify-between items-center">
                                                                        <span>
                                                                            Nhiên
                                                                            liệu
                                                                            tiêu
                                                                            thụ:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            0.00
                                                                            lít
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <Empty
                                                                    description="Trống"
                                                                    image={
                                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                                    }
                                                                />
                                                            )}
                                                        </>
                                                    ),
                                                },
                                            ]}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* right */}
                <div className="flex-1 flex relative">
                    {/* Main */}
                    {mLvehi && (
                        <div className="w-full relative">
                            <MapContainer
                                center={
                                    mLvehi && [mLvehi[0].lat, mLvehi[0].lng]
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
                                {waypoints && data && (
                                    <>
                                        <Hotline
                                            data={waypoints}
                                            getLat={(point) => point.lat}
                                            getLng={(point) => point.lng}
                                            getVal={(point) => point.value}
                                            options={{
                                                ...options,
                                                tolerance: 10,
                                                min: Math.min(
                                                    ...data?.map(
                                                        (point) => point.speed,
                                                    ),
                                                ),
                                                max:
                                                    Math.max(
                                                        ...data?.map(
                                                            (point) =>
                                                                point.speed,
                                                        ),
                                                    ) ===
                                                    Math.min(
                                                        ...data?.map(
                                                            (point) =>
                                                                point.speed,
                                                        ),
                                                    )
                                                        ? 1
                                                        : Math.max(
                                                              ...data?.map(
                                                                  (point) =>
                                                                      point.speed,
                                                              ),
                                                          ),
                                            }}
                                        />
                                    </>
                                )}
                                <RouteCar
                                    props={{
                                        data: data,
                                        pointRoute: pointRoute,
                                        pointRouteRef: pointRouteRef,
                                        loading: loading,
                                    }}
                                />
                                <SetMapCenter
                                    center={
                                        center
                                            ? center
                                            : [mLvehi[0].lat, mLvehi[0].lng]
                                    }
                                />
                            </MapContainer>
                        </div>
                    )}
                    <div id="portal-root"></div>
                    <div id="detail-portal-root" className=""></div>
                </div>
            </div>
        </div>
    );
}

export default Route;
