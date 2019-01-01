import React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ColumnEditForm from '../../components/ColumnEditForm';

@connect(({ loading }) => ({
  submitting: loading.effects['form/submitRegularForm'],
}))
@Form.create()
class ColumnForm extends React.Component {
  // handleSubmit = e => {
  //   e.preventDefault();
  //   this.props.form.validateFields((err, values) => {
  //     if (!err) {
  //       console.log('Received values of form: ', values);
  //     }
  //   });
  // };

  handleValidationError = (err) => {
    console.log('Received validation error from ColumnEditForm: ', err);
  };

  handleReceivedData = (dataList) => {
    console.log('Received data from ColumnEditForm: ', dataList);
  };


  render() {
    const { form, location } = this.props;
    const { getFieldDecorator } = form;
    return (
      <PageHeaderWrapper
        title="列编辑表单"
        tabActiveKey={location.pathname}
        content="将一个表单的编辑结果应用到多行记录上。"
      >
        <ColumnEditForm
          form={form}
          dataList={[
            {
              id: 1,
              userName: "张三",
              password: "123456",
              age: 18,
            },
            {
              id: 2,
              userName: "王五",
              password: "123qwe",
              age: 27,
            },
            {
              id: 3,
              userName: "王五",
              password: "123qwe",
              age: 18,
            },
          ]}
          onError={this.handleValidationError}
          onSuccess={this.handleReceivedData}
          formProps={{
            className: "login-form",
          }}
          fields={[
            {
              name: 'userName',
              label: '用户名',
              fieldOptions: {
                rules: [{ required: true, message: 'Please input your username!' }],
              },
              input: (
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Username"
                />
              )
            },
            {
              name: 'password',
              label: '密码',
              defaultEnabled: true,
              fieldOptions: {
                rules: [{ required: true, message: 'Please input your Password!' }],
              },
              input: (
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="Password"
                />
              ),
            }
          ]}
        >
          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(<Checkbox>Remember me</Checkbox>)}
            <a className="login-form-forgot" href="">
              Forgot password
            </a>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Log in
            </Button>
            Or <a href="">register now!</a>
          </Form.Item>
        </ColumnEditForm>
      </PageHeaderWrapper>
    );
  }
}

export default ColumnForm;
