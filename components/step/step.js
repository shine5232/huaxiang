
Component({
  properties: {
    type: Number,
    active: Number
  },
  data: {
    activeColor: '#FF4B57',
    steps1:[{
      text: '号码确认',
    }, {
      text: '身份识别',
    }, {
      text: '告知签署',
    }],
    steps2:[{
      text: '号码确认',
    }, {
      text: '身份识别',
    }, {
      text: '告知签署',
    },{
      text: '预存支付',
    }],
    steps3:[{
      text: '号码校验',
    }, {
      text: '信息登记',
    }, {
      text: '人脸识别',
    }],
  },
  methods: {
    onLoad() {
      
    },
  },
});
