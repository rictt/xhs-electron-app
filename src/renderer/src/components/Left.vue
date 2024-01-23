
<script setup lang="ts">
</script>
<template>
  <div class="left-container">
    <div class="account">
      <img class="avatar" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMkAAABICAMAAABr9CFKAAAAP1BMVEUAAAD/I0L/JEL/JEH/JED/IED/JEH/JUL/JEL/I0H/IED/I0L/JEH/JUD/JEH/I0L/I0D/JEH/I0P/JEP/JEKyzp5HAAAAFHRSTlMA34BgQB+/n++gEJCwMHCfUM9Qz4ilXboAAAQzSURBVGje1ZrrtqMgDIW5S/HSm+//rLNmbFdNNybUg0zP/nd6DOaTkEBUbSr5lZIq1BRWGtROuXkt9UPZeaVQaqXXVt0vJiFGs/9Ckuu+KflCEl1mcyMeuF9MErYi8j5z6tUiP7O6B+MUle/jPOvO1yRBTyyJOk4dsWeljV/7GB+/3iqTnMHkxySoaDLBHMd6JDgllUhQ2uOooSpJTyxSPRJEQQ9dNRJMwZVJ8DEN659MLRKsikeSzANkyq4WCU7JoSSzeyfpK5HglBxMEt5JLpVIsCoeQkIfVRAdlEnkFHw4yURJbCUSrIqHkwyExNSr8R5cO5hEr0jCs5hczEo3nmTs1kr5KZnjZF/6N5hZFCjB2z3T0+RELjOLek1uoZRbLr74/FrtBBLIUMzTxMVvIJUW7+rxVxTmZSTJuzyChyhXhQRj1EslzfAkKe+KZuK5IUmE/MmseEi25FqUbUlCzC4Cic65GeQpaU/iPiEx4no3LUiYRYwkbHqYmE1FKxI08wLJKZOyT0zN+38k6hOSgR4WUb4VCbocGRL0JWRuDKTtSCZwmSGBq9nC6OqSRJYEnzKSyIA28ClYJjF6pUiHeert1xB6S3j6IhJx8+P/CapsKclp3qe73Rij40hwC5n4o8ABJCjtshXCSE55JjfBDuAQEpTZQQI7ArY0HUeCKPgcRRJuJZwhUA8kQT9gcJ4EwZnIa0USE0NikARfhRhuShqSzAYfpEgy5Dt/MJJrShJhlSaWBJM282ayKck8QqnjSLCQDkwKbksyba9sU/L7lWkMtyXp37aEV5EEyfNdCd0tmhqRdG9DBJnklj8EKLe7I4Htw4E6mdGgsa1GrAaZZNxYV+dDOxIoGykJHMxFEv9RF9IeRqIcSzLJJCrfwJiO7kjIb2wijJ0jEZPt/diOBApWOBRGkeSUC8fETEkjkjOkIolkIhaJI+lUQ5JI/pRI8DYXrqHqWpIYWPASSSL/8Ew5uaqWJB6GlkhUyMaP05iCW5IQv6IqIjEbS3q0hkq1JCFWQxmJK/1AsCkJCRYrkGBFGb+KxEGoSCTmZf5VJEpDqAgkI0ziZfwKkgkGFkhUwDfCMfSTpUoPt+xLAz0dwdUfkQxAkiJ4K3y+cSFTQq4FG68Lv3n4lMRnirpZ+eXtojPcB9a8TopzdsIz5n4SPI/1cD55TopmzhmwtO3W5xRYanRNErNpH15r5wYVnHs5dV1cZZztgLICSYpMR+Jh2cEo7PeSrvKUyCTYo8rvZLXPtbCZCtiXTkldEieZu5GNRa1Qt6IpCVVJcEAMGj4WbekHkPhWuDaJy1vLjUL5izvHhe25Bgnmmnz0o1IRcFFVnOuTTEwvCnQqAuGctUBZjQSDX49FARNNUpx6dkqqkmDwyw4OcXmhf+1sUry8DZsZot9LMuq1FFW6/vV/8XDonXroDwd3OfCOVCS+AAAAAElFTkSuQmCC" />
      <div class="account-id">账号ID：819221812</div>
    </div>
    <div class="xhs-list">
      <div class="xhs-item active">
        <img class="xhs-avatar" src="https://sns-avatar-qc.xhscdn.com/avatar/61727ede1f4003dc393c64fa.jpg?imageView2/2/w/120/format/jpg" />
        <div class="xhs-info">
          <div class="info-nickname">爱做饭的程序员</div>
          <div class="info-status">
            <!-- <div class="normal-status">账号正常</div> -->
            <div class="status unnormal-status">已离线</div>
          </div>
        </div>
      </div>
      <div class="xhs-item">
        <img class="xhs-avatar" src="https://sns-avatar-qc.xhscdn.com/avatar/c94b2589011be6d87bfbbbf21db9e2a0.jpg?imageView2/2/w/120/format/jpg" />
        <div class="xhs-info">
          <div class="info-nickname">22爱做饭的程序员</div>
          <div class="info-status">
            <div class="status normal-status">账号正常</div>
            <div class="status unnormal-status">已离线</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.left-container {
  width: 240px;
  height: 100%;
  background-color: #2f3241;
}

.account {
  padding: 10px;
  text-align: center;
  .avatar {
    display: block;
    width: 80px;
    height: 80px;
    margin: 0 auto;
    border-radius: 50%;
    padding: 6px;
    object-fit: contain;
    background-color: #fff;
  }
  .account-id {
    padding: 10px 0;
    color: #fff;
    font-weight: normal;
    font-size: 14px;
  }
}

.xhs-list {
  margin: 0 10px;
  background-color: #fff;
  color: #565656;
  border-radius: 10px;
  overflow: hidden;
}

.xhs-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 13px;
  padding: 10px;

  border-bottom: 1px solid #f2f2f2;
  padding-bottom: 10px;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &.active {
    background-color: #ddd;
  }
  .xhs-avatar {
    width: 36px;
    margin-right: 10px;
    border-radius: 50%;
    border: 1px solid #ddd;
  }

  .xhs-info {
    flex: 1;
    color: #000;

    .info-status {
      display: flex;
      width: 100%;
      color: #999;
      padding-top: 4px;
      .status {
        font-size: 12px;
        flex: 1;
        position: relative;
        padding-left: 10px;
        &::before {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
      }
      .normal-status {
        &::before {
          background-color: #43f943;
        }
      }
      .unnormal-status {
        &::before {
          background-color: #f93a3a;
        }
      }
    }
  }
}
</style>
