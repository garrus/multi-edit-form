import React from 'react';
import PropTypes from 'prop-types';
import { Form, Tooltip, Switch, Icon } from 'antd';


function calcMostFreqValues(dataList, nameList) {
  const ret = {};
  nameList.forEach(name => {
    const stat = {};
    dataList.forEach(data => {
      if (typeof stat[data[name]] === 'undefined') {
        stat[data[name]] = 1;
      } else {
        stat[data[name]] += 1;
      }
    });
    let max = 0;
    Object.keys.call(null, stat).forEach(v => {
      if (stat[v] > max) {
        max = stat[v];
        ret[name] = v;
      }
    });
  });
  return ret;
}

class ColumnEditFormItem extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    defaultEnabled: PropTypes.bool,
    itemProps: PropTypes.object,
    onToggleField: PropTypes.func.isRequired,
  };

  static defaultProps = {
    label: '',
    itemProps: {},
    defaultEnabled: false,
  };

  state = {
    enabled: false,
  };

  constructor(props) {
    super(props);
    this.state.enabled = props.defaultEnabled;
  }

  handleChange = (checked) => {
    const { onToggleField, name } = this.props;
    onToggleField(name, checked);
    this.setState({ enabled: checked });
  };

  render() {
    const { label, itemProps, children } = this.props;
    const { enabled } = this.state;

    return (
      <>
        <Switch
          onChange={this.handleChange}
          defaultChecked={enabled}
          checkedChildren={<Icon theme="filled" type="edit" />}
          unCheckedChildren={<Icon theme="filled" type="stop" />}
        />
        <span style={{
          color: enabled ? 'gray' : 'red',
          marginLeft: '0.5em',
          verticalAlign: 'middle',
        }}
        >
          {enabled ? '对此字段的编辑将会生效' : '打开开关后编辑结果才能生效'}
        </span>
        <Form.Item {...itemProps} label={label} style={{ opacity: enabled ? 1 : 0.3 }}>
          {
            enabled ?
            children :
            <Tooltip title='需要先开启编辑，对此字段的编辑才能生效。'>{children}</Tooltip>
          }
        </Form.Item>
      </>
    );
  }
}

export default class ColumnEditForm extends React.Component {
  static propTypes = {
    dataList: PropTypes.arrayOf(PropTypes.object).isRequired,
    keyField: PropTypes.string,
    onError: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
      defaultEnabled: PropTypes.bool,
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      itemProps: PropTypes.object,
      fieldOptions: PropTypes.object.isRequired,
      input: PropTypes.object.isRequired,
    })).isRequired,
  };

  static defaultProps = {
    keyField: 'id',
  };

  fieldToggles = {};

  mostFreqValues = {};

  componentWillMount() {
    const { fields } = this.props;
    fields.forEach(field => {
      this.fieldToggles[field.name] = !!field.defaultEnabled;
    });
    this.calcMostFreqValues();
  }

  composeValues = values => {
    const { dataList } = this.props;

    // 只修改勾选的列
    const toggledValues = {};
    Object.keys.call(null, this.fieldToggles).forEach(f => {
      if (this.fieldToggles[f]) {
        toggledValues[f] = values[f];
      }
    });

    const retDataList = [];
    dataList.forEach(data => {
      // 只向上传递有变化的数据行。
      let changed = false;
      for (const f of Object.keys.call(null, toggledValues)) {
        if (!changed && data[f] !== toggledValues[f]) {
          changed = true;
          break;
        }
      }
      if (changed) {
        retDataList.push({ ...data, ...toggledValues });
      }
    });
    return retDataList;
  };

  handleSubmit = (e) => {
    const { form, onError, onSuccess } = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (err) {
        onError(err);
      } else {
        console.log('Received values of form: ', values);
        const composedValues = this.composeValues(values);
        console.log('Sending values: ', composedValues);
        onSuccess(composedValues);
      }
    });
  };

  toggleField = (name, toggled) => {
    this.fieldToggles[name] = !!toggled;
  };

  calcMostFreqValues() {
    const { dataList, fields } = this.props;
    this.mostFreqValues = calcMostFreqValues(dataList, fields.map(f => f.name));
  }

  render() {
    const { formProps, fields, dataList, children, form } = this.props;
    const { handleSubmit, toggleField, mostFreqValues } = this;

    return (
      <div>
        <p style={{ color: 'gray' }}>
          编辑结果将最多影响 <strong>{dataList.length}</strong> 行数据
        </p>
        <Form
          {...formProps}
          onSubmit={handleSubmit}
          hideRequiredMark
        >
          {
            fields.map(field => (
              <ColumnEditFormItem
                key={field.name}
                onToggleField={toggleField}
                {...field}
              >
                {
                  form.getFieldDecorator(field.name, {
                    initialValue: mostFreqValues[field.name],
                    ...field.fieldOptions,
                  })(field.input)
                }
              </ColumnEditFormItem>
            ))
          }
          {children}
        </Form>
      </div>
    );
  }
}

