import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, QRCode, Space, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ISOICon, QCVNICon, TCVNICon } from '~/icons';
import { login } from '~/services';

function Login() {
    const [loading, setLoading] = useState(false);
    const navigator = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = (values) => {
        const fetch = async () => {
            setLoading(true);
            const res = await login({
                pwd: values.password,
                username: values.username,
                remember: values.remember,
            });
            if (res.result === 0) {
                messageApi.open({
                    type: 'error',
                    content: 'Sai thông tin tài khoản',
                });
            } else {
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        accessToken: res?.data?.token,
                        username: values.username,
                    }),
                );
                navigator('/online');
            }
            setLoading(false);
        };
        fetch();
    };

    return (
        <>
            {contextHolder}
            <div>
                <div className="fixed top-0 left-0 bottom-0 right-0 z-[1000] w-full">
                    <div className="w-full h-full flex justify-center items-center bg-slate-200">
                        <div className="h-[90%] relative w-[90%] shadow-lg flex bg-white rounded max-lg:flex-col-reverse max-lg:w-full max-lg:h-full">
                            <div className="flex-1 flex flex-col">
                                <div
                                    className="object-cover bg-center w-[100%] flex-1 max-lg:hidden"
                                    style={{
                                        backgroundImage:
                                            'url("https://devserver.taixecongnghe.com/static/images/banner_login_v2.svg")',
                                        backgroundRepeat: 'no-repeat',
                                    }}
                                ></div>
                                <div className="text-center pt-4 pb-4 border-t">
                                    <Link className="text-base font-semibold text-[#1673ff]">
                                        MobiCAM - Camera giám sát hành trình
                                    </Link>
                                    <div className="text-xxs">
                                        <p className="pt-1 pb-1">
                                            <span className="text-[#1673ff]">
                                                Số điện thoại:
                                            </span>{' '}
                                            0899.19.19.19
                                        </p>
                                        <p className="pt-1 pb-1">
                                            <span className="text-[#1673ff]">
                                                SEmail:
                                            </span>{' '}
                                            mobicam8@gmail.com
                                        </p>
                                        <p className="pt-1 pb-1">
                                            <span className="text-[#1673ff]">
                                                Địa chỉ:
                                            </span>{' '}
                                            45 đường số 5, KDC Thăng Long Home,
                                            P. Tam Phú, TP. Thủ Đức
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative w-[400px] border-l h-full overflow-auto max-lg:w-full max-lg:py-2 flex py-3 items-center flex-col">
                                <div className="w-full h-full flex flex-col justify-center items-center">
                                    <div className="w-[80%]">
                                        <div className="flex justify-center">
                                            <div className="w-2/4 h-[100px]">
                                                <img
                                                    className="w-full"
                                                    src="https://my.mobicam.vn/static/images/logoHead.png"
                                                />
                                            </div>
                                        </div>
                                        <div className="">
                                            <Form
                                                layout="vertical"
                                                name="normal_login"
                                                className=""
                                                autoComplete="false"
                                                onFinish={onFinish}
                                                initialValues={{
                                                    remember: true,
                                                }}
                                            >
                                                <Form.Item
                                                    label="Tên đăng nhập"
                                                    name="username"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                'Tên đăng nhập không được để trống',
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        style={{
                                                            borderRadius: 2,
                                                        }}
                                                        prefix={
                                                            <UserOutlined className="site-form-item-icon" />
                                                        }
                                                        placeholder="Tên đăng nhập"
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    label="Mật khẩu"
                                                    name="password"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                'Mật khẩu không được để trống',
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        style={{
                                                            borderRadius: 2,
                                                        }}
                                                        prefix={
                                                            <LockOutlined className="site-form-item-icon" />
                                                        }
                                                        type="password"
                                                        placeholder="Mật khẩu"
                                                    />
                                                </Form.Item>
                                                <Form.Item>
                                                    <Form.Item
                                                        name="remember"
                                                        valuePropName="checked"
                                                        noStyle
                                                    >
                                                        <Checkbox>
                                                            Ghi nhớ tài khoản
                                                        </Checkbox>
                                                    </Form.Item>

                                                    <a
                                                        className="login-form-forgot"
                                                        href=""
                                                    ></a>
                                                </Form.Item>

                                                <Form.Item className="w-full">
                                                    <Button
                                                        loading={loading}
                                                        type="primary"
                                                        htmlType="submit"
                                                        className="login-form-button"
                                                        style={{
                                                            width: '100%',
                                                            borderRadius: 2,
                                                        }}
                                                    >
                                                        ĐĂNG NHẬP
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <Link className="mr-2">
                                                <div className="h-8">
                                                    <img
                                                        className="h-full"
                                                        src="https://my.mobicam.vn/static/images/google_play_icon.png"
                                                    />
                                                </div>
                                            </Link>
                                            <Link>
                                                <div className="h-8">
                                                    <img
                                                        className="h-full"
                                                        src="https://my.mobicam.vn/static/images/app_store_icon.png"
                                                    />
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="flex mt-4 items-center justify-center gap-4">
                                            <Space
                                                direction="vertical"
                                                align="center"
                                            >
                                                <QRCode value="https://my.mobicam.vn/" />
                                                <p className="text-xxs">
                                                    Quét mã QR để tải app
                                                </p>
                                            </Space>
                                            <Space
                                                direction="vertical"
                                                align="center"
                                            >
                                                <QRCode
                                                    icon="https://my.mobicam.vn/static/images/zalo.png"
                                                    value="https://my.mobicam.vn/"
                                                />
                                                <p className="text-xxs">
                                                    Quét mã QR hỗ trợ Zalo
                                                </p>
                                            </Space>
                                        </div>
                                        <div className="flex gap-4 fill-theme mt-4 justify-center">
                                            <div className="h-16 shadow w-16 hover:hover-fill-svg flex items-center justify-center transition-all rounded-sm">
                                                <TCVNICon />
                                            </div>
                                            <div className="h-16 shadow w-16 hover:hover-fill-svg flex items-center justify-center transition-all rounded-sm">
                                                <QCVNICon />
                                            </div>
                                            <div className="h-16 shadow w-16 hover:hover-fill-svg flex items-center justify-center transition-all rounded-sm">
                                                <ISOICon />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
