<template>
  <el-container :style="{width:'100%', height:'100%'}">
    <el-header :style="{backgroundColor:'#34374C', display:'flex', justifyContent:'space-between', alignItems:'center'}">
      <div :style="{fontSize:'24px', color:'#E3F8FF'}">Route Explorer</div>
      <div>
        <el-button icon="fas fa-plus" @click="openNewPage"> 開新分頁</el-button>
      </div>
    </el-header>
    <el-container >
      <el-aside :style="{backgroundColor:'#4d4f5c', width:'240px'}">
        <div class="block" :style="{padding:8+'px'}">
          <!--add route & save route button -->
          <el-row :gutter="4">
            <el-col :span="12">
              <el-button :style="{width:'100%'}" icon="fas fa-plus" @click="openAddRouteDialog" type="primary"> 新增路線</el-button>
            </el-col>
            <el-col :span="12">
              <el-button :style="{width:'100%'}" icon="fas fa-save" :disabled="routes.length === 0" @click="openSaveDialog"> 儲存資料</el-button>
            </el-col>
          </el-row>
          
          <!-- card of routes -->
          <el-card v-for="route in routes" class="box-card route-card" :key="route.id" :body-style="{padding:'0px'}">
            <div slot="header" class="clearfix">
              <!-- Any way to force re-render? -->
              <!-- https://github.com/vuejs/Discussion/issues/356 -->
              <el-switch v-model="route.show" :active-color="route.color" :key="route.color" @change="handleShowChange(route.id)"></el-switch>
              {{route.name}}
              <el-color-picker v-model="route.color" style="float:right;" size="small" @change="handleColorChange(route.id)"></el-color-picker>
            </div>
            <div class="text item" :style="{padding:'8px 16px 4px 16px'}">
              <el-row :style="{padding:'4px'}">
                <el-col :span="3"><i class="fas fa-calendar-alt"></i></el-col>
                <el-col :span="21">
                  {{route.data[0][0].format('YYYY-MM-DD HH:mm:ss')}} ~<br />
                  {{route.data[route.data.length-1][0].format('YYYY-MM-DD HH:mm:ss')}}
                </el-col>
              </el-row>
              <el-row :style="{padding:'4px'}">
                <el-col :span="3"><i class="fas fa-map-marker-alt"></i></el-col>
                <el-col :span="21">{{route.data.length}} 個</el-col>
              </el-row>
            </div>
            <div class="bottom clearfix" :style="{padding:'4px 16px'}">
              <el-button type="text" class="button" icon="fas fa-trash" @click="openDeleteDialog(route)">刪除</el-button>
            </div>
          </el-card>
        </div>
      </el-aside>
      <el-main :style="{backgroundColor:'#d3dce6', padding:0, position:'relative'}">
        <!-- google map -->
        <div ref="map" id="map" :style="{width:'100%',height:'100%'}"></div>
        
        <!-- time controller -->
        <div :style="{padding:'0 8px 20px 8px', boxSizing:'border-box', position:'absolute', bottom:0, width:'100%'}">
          <div :style="{backgroundColor:'#90A4AE', opacity:0.85, padding:'8px', borderRadius:'8px'}">
            <el-date-picker
              v-model="beginTime"
              type="datetime"
              :disabled="!routes || routes.length === 0"
              :clearable="false"
              :picker-options="{ 
                disabledDate(time) { 
                  return time.getTime() < defaultBeginTime || time.getTime() > defaultEndTime 
                }
              }"
              @change="handleBeginTimeChange"
              placeholder="選擇起始時間">
            </el-date-picker>
            <el-date-picker
              v-model="endTime"
              type="datetime"
              :disabled="!routes || routes.length === 0"
              :clearable="false"
              :picker-options="{ 
                disabledDate(time) { 
                  return time < defaultBeginTime || time > defaultEndTime 
                }
              }"
              @change="handleEndTimeChange"
              placeholder="選擇結束時間">
            </el-date-picker>
            <el-button-group>
              <el-button 
                icon="fas fa-play" 
                :disabled="!beginTime || !endTime || sliderVal === 100" 
                @click="handleSliderAutoPlay">
              </el-button>
              <el-button 
                icon="fas fa-pause" 
                :disabled="!beginTime || !endTime || sliderVal === 100" 
                @click="handleSliderPause">
              </el-button>
              <el-button 
                icon="fas fa-stop" 
                :disabled="!beginTime || !endTime" 
                @click="handleSliderStop">
              </el-button>
            </el-button-group>
            <el-row type="flex" align="middle">
              <el-col :span="21">
                <el-slider
                  v-model="sliderVal"
                  :style="{padding:'8px'}"
                  :disabled="!beginTime || !endTime"
                  :format-tooltip="formatTooltip"
                  :show-tooltip="true"
                  :step="2"
                  @change="handleSliderChange">
                </el-slider>
              </el-col>
              <el-col :span="3">
                <div class="text item" :style="{padding:'8px', color:'black', fontSize:'16px', fontWeight:'bold'}">
                  <span v-if="beginTime && endTime">{{sliderEndTime}}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-main>
      
      <!-- add route dialog -->
      <el-dialog
        title="新增路線"
        :visible.sync="addRouteDialogShow"
        width="60%">
        <el-form label-width="72px" id="form">
          <el-form-item label="路線名稱">
            <el-input v-model="addRouteForm.name" placeholder="請輸入路線名稱"></el-input>
          </el-form-item>
          <el-form-item label="路線顏色">
            <el-color-picker v-model="addRouteForm.color" size="small" :clearable="false"></el-color-picker>
          </el-form-item>
          <el-form-item label="位置資料">
            <el-input
              type="textarea"
              :autosize="{ minRows: 10, maxRows: 10 }"
              :placeholder="addRouteForm.placeholder"
              v-model="addRouteForm.data"
            >
            </el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeAddRouteDialog">取消</el-button>
          <el-button type="primary" @click="handleAddRoute">確定</el-button>
        </span>
      </el-dialog>
      
      <!-- save route data dialog -->
      <el-dialog
        v-if="saveDialogShow"
        title="儲存資料"
        :visible.sync="saveDialogShow"
        width="60%">
        <div v-if="isEmptyPage" :style="{fontSize:'16px'}">
          資料 ID 是 <b>{{saveId}}</b>，資料儲存後可以隨時連到 <b>http://route01-fayehuang.c9users.io/{{saveId}}</b> 繼續探索資料。<br /><br />
          確定儲存資料？確定後頁面將會被導到 <b>http://route01-fayehuang.c9users.io/{{saveId}}</b>
        </div>
        <div v-else :style="{fontSize:'16px'}">
          資料 ID 是 <b>{{saveId}}</b>，資料儲存後可以隨時連到 <b>http://route01-fayehuang.c9users.io/{{saveId}}</b> 繼續探索資料。<br /><br />
          確定儲存資料？
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeSaveDialog">取消</el-button>
          <el-button type="primary" @click="saveData">確定</el-button>
        </span>
      </el-dialog>
      
      <!-- URL not found dialog -->
      <el-dialog
        title="提示"
        :visible.sync="alertDialogShow"
        width="50%">
        <div :style="{fontSize:'16px'}">
          找不到此頁面，請檢查網址是否正確。
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="closeAlertDialog">確定</el-button>
        </span>
      </el-dialog>
      
      <!-- delete route dialog -->
      <el-dialog
        v-if="deleteDialogShow"
        title="提示"
        :visible.sync="deleteDialogShow"
        width="400px">
        <div :style="{fontSize:'16px'}">
          確定刪除路線 <b>{{deleteRoute.name}}</b>？
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeDeleteDialog">取消</el-button>
          <el-button type="primary" @click="handleRemoveRoute">確定</el-button>
        </span>
      </el-dialog>
      
    </el-container>
  </el-container>
</template>

<script>
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import * as firebase from 'firebase';
import { Loading } from 'element-ui';
import {
  initMarkerClusterer,
  initMarker,
  setMapCenterZoom,
  hideRoute,
  showRoute,
  setMarkerColor,
  setMarkerClusterColor,
} from '../libs/map';

export default {
  name: 'app',
  data() {
    return {
      initLoading: null,
      isEmptyPage: true,
      map: null,
      addRouteDialogShow: false,
      saveDialogShow: false,
      saveId: null,
      alertDialogShow: false,
      deleteDialogShow: false,
      deleteRoute: null,
      addRouteForm: {
        name: null,
        data: null,
        color: '#409EFF',
        placeholder: '請輸入位置資料，格式：「YYYY-MM-DD HH:mm:ss,latitude,longitude」，一行一筆資料。例如：\n\n' +
          '2017-12-23 10:00:02,24.798645999999998,121.364135\n' +
          '2017-12-23 10:00:04,24.798815,121.364267\n' +
          '2017-12-23 10:00:06,24.798989000000002,121.364397',
      },
      routes: [],
      defaultBeginTime: null,
      defaultEndTime: null,
      beginTime: null,
      endTime: null,
      sliderVal: 0,
      sliderAuto: null,
    };
  },
  computed: {
    sliderEndTime() {
      return this.calSliderTime(this.sliderVal).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  methods: {
    drawAllRoutes() {
      let fitMarkers = [];
      this.routes.filter(route => route.show).forEach((route, routeIndex) => {
        const routeFitMarkers = route.data.map(r => r[3]);
        if (route.fitMarkers && route.fitMarkers.length > 0) {
          hideRoute({
            markerCluster: route.markerCluster,
            firstMarker: route.fitMarkers[0],
            lastMarker: route.fitMarkers[route.fitMarkers.length - 1],
          });
        }
        showRoute(this.map, {
          routeColor: route.color,
          markerCluster: route.markerCluster,
          markers: routeFitMarkers,
          firstMarker: routeFitMarkers[0],
          lastMarker: routeFitMarkers[routeFitMarkers.length - 1],
        });
        this.routes[routeIndex].fitMarkers = routeFitMarkers;
        // update data "defaultBeginTime", "beginTime"
        const records = route.data;
        if (!this.defaultBeginTime ||
            (this.defaultBeginTime &&
             records[0][0].toDate() < this.defaultBeginTime)) {
          this.defaultBeginTime = records[0][0].toDate();
          this.beginTime = this.defaultBeginTime;
        }
        // update data "defaultEndTime", "endTime"
        if (!this.defaultEndTime ||
            (this.defaultEndTime &&
             records[records.length - 1][0].toDate() > this.defaultEndTime)) {
          this.defaultEndTime = records[records.length - 1][0].toDate();
          this.endTime = this.defaultEndTime;
        }
        fitMarkers = [...fitMarkers, ...routeFitMarkers];
      });
      this.beginTime = this.defaultBeginTime;
      this.endTime = this.defaultEndTime;
      if (fitMarkers.length > 0) {
        setMapCenterZoom(this.map, fitMarkers);
      }
    },
    drawRouteByTime({ beginTime, endTime, fitAll }) {
      let fitMarkers = [];
      this.routes.filter(route => route.show).forEach((route, routeIndex) => {
        let routeFitMarkers = [];
        route.data.forEach((record) => {
          const time = record[0].toDate();
          if (time >= beginTime && time <= endTime) {
            routeFitMarkers = [...routeFitMarkers, record[3]];
          }
        });
        if (route.fitMarkers && route.fitMarkers.length > 0) {
          hideRoute({
            markerCluster: route.markerCluster,
            firstMarker: route.fitMarkers[0],
            lastMarker: route.fitMarkers[route.fitMarkers.length - 1],
          });
        }
        showRoute(this.map, {
          routeColor: route.color,
          markerCluster: route.markerCluster,
          markers: routeFitMarkers,
          firstMarker: routeFitMarkers[0],
          lastMarker: routeFitMarkers[routeFitMarkers.length - 1],
        });
        this.routes[routeIndex].fitMarkers = routeFitMarkers;
        const count = 30;
        if (!fitAll && routeFitMarkers.length > count) {
          fitMarkers = [...fitMarkers, ...routeFitMarkers.slice(-count)];
        } else {
          fitMarkers = [...fitMarkers, ...routeFitMarkers];
        }
      });
      if (fitMarkers.length > 0) {
        setMapCenterZoom(this.map, fitMarkers);
      }
    },
    calSliderTime(val) {
      let time = null;
      const interval = (moment(this.endTime).unix() - moment(this.beginTime).unix()) / 100;
      if (val === 0) {
        time = moment(this.beginTime);
      } else if (val === 100) {
        time = moment(this.endTime);
      } else {
        const unixTime = moment(this.beginTime).unix() + (val * interval);
        time = moment.unix(unixTime);
      }
      return time;
    },
    formatTooltip(val) {
      return this.calSliderTime(val).format('YYYY-MM-DD HH:mm:ss');
    },
    openAddRouteDialog() {
      this.addRouteForm.name = null;
      this.addRouteForm.data = null;
      this.addRouteForm.color = '#00ADB5';
      this.addRouteDialogShow = true;
    },
    closeAddRouteDialog() {
      this.addRouteDialogShow = false;
    },
    openSaveDialog() {
      if (this.isEmptyPage) {
        this.saveId = uuidv4().split('-')[0];
      }
      this.saveDialogShow = true;
    },
    closeSaveDialog() {
      this.saveDialogShow = false;
    },
    closeAlertDialog() {
      this.alertDialogShow = false;
      this.$router.push({ path: '/' });
    },
    openDeleteDialog(route) {
      this.deleteRoute = route;
      this.deleteDialogShow = true;
    },
    closeDeleteDialog() {
      this.deleteRoute = null;
      this.deleteDialogShow = false;
    },
    handleAddRoute() {
      // 處理 input 資料
      let records = this.addRouteForm.data.trim().split('\n').map((line) => {
        const time = moment(line.split(',')[0].trim(), 'YYYY-MM-DD HH:mm:ss');
        const lat = parseFloat(line.split(',')[1].trim());
        const lng = parseFloat(line.split(',')[2].trim());
        return [time, lat, lng];
      });
      // 根據時間作排序
      records = records.sort((a, b) => {
        const aTime = a[0];
        const bTime = b[0];
        if (aTime < bTime) {
          return -1;
        } else if (aTime > bTime) {
          return 1;
        }
        return 0;
      });
      // init markers
      let routeFitMarkers = [];
      records = records.map((record, index) => {
        const marker = initMarker(this.map, {
          routeName: this.addRouteForm.name,
          routeColor: this.addRouteForm.color,
          index,
          time: record[0],
          lat: record[1],
          lng: record[2],
          isFirstRecord: index === 0,
          isLastRecord: index === records.length - 1,
        });
        routeFitMarkers = [...routeFitMarkers, marker];
        return [...record, marker];
      });
      // update data "routes"
      this.routes = [...this.routes, {
        name: this.addRouteForm.name,
        color: this.addRouteForm.color,
        show: true,
        data: records,
        id: uuidv4(),
        markerCluster: initMarkerClusterer(this.map, this.addRouteForm.color),
      }];
      // draw routes
      if (this.sliderVal > 0) {
        this.drawRouteByTime({
          beginTime: moment(this.beginTime),
          endTime: this.calSliderTime(this.sliderVal),
          fitAll: false,
        });
      } else {
        this.drawAllRoutes();
      }
      // update data "addRouteDialogShow"
      this.addRouteDialogShow = false;
    },
    handleRemoveRoute() {
      const id = this.deleteRoute.id;
      const targetRoute = this.routes.find(route => route.id === id);
      hideRoute({
        markerCluster: targetRoute.markerCluster,
        firstMarker: targetRoute.fitMarkers[0],
        lastMarker: targetRoute.fitMarkers[targetRoute.fitMarkers.length - 1],
      });
      this.routes = this.routes.filter(route => route.id !== id);
      if (this.routes.length === 0) {
        this.defaultBeginTime = null;
        this.defaultEndTime = null;
        this.beginTime = null;
        this.endTime = null;
        this.sliderVal = 0;
        this.sliderAuto = null;
      } else if (this.sliderVal > 0) {
        this.drawRouteByTime({
          beginTime: moment(this.beginTime),
          endTime: this.calSliderTime(this.sliderVal),
          fitAll: false,
        });
      } else {
        this.drawAllRoutes();
      }
      this.closeDeleteDialog();
    },
    handleColorChange(id) {
      const targetRoute = this.routes.find(route => route.id === id);
      const color = targetRoute.color;
      targetRoute.data.forEach((record, index) => {
        const marker = record[3];
        setMarkerColor({
          marker,
          color,
          isFirstRecord: index === 0,
          isLastRecord: index === targetRoute.data.length - 1 ||
                        index === targetRoute.fitMarkers.length - 1,
        });
      });
      setMarkerClusterColor({
        markerCluster: targetRoute.markerCluster,
        color,
      });
      targetRoute.markerCluster.repaint();
    },
    handleSliderChange() {
      const beginTime = moment(this.beginTime);
      const endTime = this.calSliderTime(this.sliderVal);
      this.drawRouteByTime({ beginTime, endTime, fitAll: false });
    },
    handleSliderAutoPlay() {
      this.sliderAuto = window.setInterval(() => {
        this.sliderVal += 1;
        const beginTime = moment(this.beginTime);
        const endTime = this.calSliderTime(this.sliderVal);
        this.drawRouteByTime({ beginTime, endTime, fitAll: false });
        if (this.sliderVal === 100) {
          window.clearInterval(this.sliderAuto);
        }
      }, 1000);
    },
    handleSliderPause() {
      window.clearInterval(this.sliderAuto);
    },
    handleSliderStop() {
      window.clearInterval(this.sliderAuto);
      this.sliderVal = 0;
      const beginTime = moment(this.beginTime);
      const endTime = moment(this.endTime);
      this.drawRouteByTime({ beginTime, endTime, fitAll: true });
    },
    handleShowChange(id) {
      const targetRoute = this.routes.filter(route => route.id === id)[0];
      if (targetRoute.show) {
        const beginTime = moment(this.beginTime);
        const endTime = this.sliderVal > 0 ?
          this.calSliderTime(this.sliderVal) : moment(this.endTime);
        this.drawRouteByTime({
          beginTime,
          endTime,
          fitAll: this.sliderVal === 0,
        });
      } else {
        hideRoute({
          markerCluster: targetRoute.markerCluster,
          firstMarker: targetRoute.fitMarkers[0],
          lastMarker: targetRoute.fitMarkers[targetRoute.fitMarkers.length - 1],
        });
      }
    },
    handleBeginTimeChange() {
      const beginTime = moment(this.beginTime);
      const endTime = moment(this.endTime);
      this.drawRouteByTime({ beginTime, endTime, fitAll: true });
      this.sliderVal = 0;
    },
    handleEndTimeChange() {
      const beginTime = moment(this.beginTime);
      const endTime = moment(this.endTime);
      this.drawRouteByTime({ beginTime, endTime, fitAll: true });
      this.sliderVal = 0;
    },
    saveData() {
      this.initLoading = Loading.service({ fullscreen: true });
      let data = {};
      this.routes.forEach((route) => {
        const records = route.data.map((record) => {
          const time = record[0].format('YYYY-MM-DD HH:mm:ss');
          const lat = record[1];
          const lng = record[2];
          return [time, lat, lng];
        });
        const result = {};
        result[route.id] = {};
        result[route.id] = {
          name: route.name,
          color: route.color,
          show: route.show,
          data: records,
        };
        data = { ...data, ...result };
      });
      firebase.database().ref(`pages/${this.saveId}`).set(data).then(() => {
        this.saveDialogShow = false;
        this.isEmptyPage = false;
        this.$nextTick(() => {
          this.initLoading.close();
        });
        this.$router.push({ path: `/${this.saveId}` });
      });
    },
    openNewPage() {
      window.open('https://routeexplorer-eed26.firebaseapp.com', '_blank');
    },
  },
  created() {
    const routeName = this.$route.name;
    if (routeName === 'pages') {
      this.isEmptyPage = false;
      this.initLoading = Loading.service({ fullscreen: true });
    } else {
      this.isEmptyPage = true;
    }
  },
  mounted() {
    // init map
    const map = new window.google.maps.Map(this.$refs.map, {
      zoom: 12,
      center: { lat: 25.034020, lng: 121.564478 }, // Taipei 101
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP,
      },
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP,
      },
    });
    this.map = map;
    // load init data
    if (!this.isEmptyPage) {
      const path = this.$route.path.split('/')[1];
      firebase.database().ref('pages').once('value').then((snapshot) => {
        if (snapshot.val() &&
            Object.keys(snapshot.val()).includes(path)) {
          this.saveId = path;
          const routes = snapshot.val()[path];
          let fitMarkers = [];
          this.routes = Object.keys(routes).map((routeId) => {
            const route = routes[routeId];
            route.markerCluster = initMarkerClusterer(this.map, route.color);
            route.fitMarkers = [];
            const records = route.data.map((record, index) => {
              const time = moment(record[0]);
              const lat = record[1];
              const lng = record[2];
              const marker = initMarker(this.map, {
                routeName: route.name,
                routeColor: route.color,
                isFirstRecord: index === 0,
                isLastRecord: index === route.data.length - 1,
                index,
                time,
                lat,
                lng,
              });
              if (route.show) {
                route.fitMarkers = [...route.fitMarkers, marker];
              }
              return [time, lat, lng, marker];
            });
            if (route.show) {
              fitMarkers = [...fitMarkers, ...route.fitMarkers];
              showRoute(this.map, {
                routeColor: route.color,
                markerCluster: route.markerCluster,
                markers: route.fitMarkers,
                firstMarker: route.fitMarkers[0],
                lastMarker: route.fitMarkers[route.fitMarkers.length - 1],
              });
            }
            // update data "defaultBeginTime", "beginTime"
            if (!this.defaultBeginTime ||
                (this.defaultBeginTime && records[0][0].toDate() < this.defaultBeginTime)) {
              this.defaultBeginTime = records[0][0].toDate();
              this.beginTime = this.defaultBeginTime;
            }
            // update data "defaultEndTime", "endTime"
            if (!this.defaultEndTime ||
                (this.defaultEndTime &&
                 records[records.length - 1][0].toDate() > this.defaultEndTime)) {
              this.defaultEndTime = records[records.length - 1][0].toDate();
              this.endTime = this.defaultEndTime;
            }
            return {
              ...route,
              id: routeId,
              data: records,
            };
          });
          if (fitMarkers.length > 0) {
            setMapCenterZoom(this.map, fitMarkers);
          }
        } else {
          this.isEmptyPage = true;
          this.alertDialogShow = true;
        }
        this.$nextTick(() => {
          this.initLoading.close();
        });
      });
    }
  },
};
</script>

<style>
.route-card {
  margin: 4px 0;
}
</style>
