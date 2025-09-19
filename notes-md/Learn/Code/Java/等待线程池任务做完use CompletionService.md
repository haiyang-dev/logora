

```javascript
public static void main(String[] args) {
    ScheduledExecutorService ses = Executors.newScheduledThreadPool(1);
    ses.scheduleAtFixedRate(new testSTask(), 1000, 1000, TimeUnit.MILLISECONDS);
}
```



```javascript
class testSTask implements Runnable{
    private static final Logger logger = LoggerFactory.getLogger(com.refinitiv.timeseries.snapshot.testSTask.class);
    private List<Integer> testlist;
    ttes1 ttesC;
    public testSTask(){
        this.testlist = testlist;
        this.ttesC = new ttes1(12);
        this.testlist= new ArrayList<>();
    }

    @Override
    public void run() {
        try {
            testlist.clear();
            logger.info("[testSTask] timer beat");
            for(int i = 0; i < 100000; i++)
            {
                testlist.add(i);
            }
            ttesC.sendHttpsPost(testlist);
//            while (testlist.size() > 0)
//            {
//                logger.info("[testSTask] testlist size = {}", testlist.size());
//                TimeUnit.MILLISECONDS.sleep(100);
//            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}

class ttes1{
    private static final Logger logger = LoggerFactory.getLogger(com.refinitiv.timeseries.snapshot.ttes1.class);
    private CompletionService<Integer> completionService;
    public ttes1(int n){
        ExecutorService es = Executors.newFixedThreadPool(n);
        this.completionService = new ExecutorCompletionService<Integer>(es);
    }
    public void sendHttpsPost(List<Integer> testlist) throws InterruptedException, ExecutionException {
        // Instant instantNow = Instant.now();
        // logger.info("[ttes] [sendHttpsPost-s] time now = {}", instantNow);
        for (int req : testlist) {
            //            completionService.submit(new Callable<Integer>(){
//                @Override
//                public Integer call() throws Exception {
//                    logger.info("[ttes1] req = {}", req);
//                    return req;
//                }
//            });
            completionService.submit(new callTask(req));
            // instantNow = Instant.now();
            // logger.info("[ttes] [sendHttpsPost-e] time now = {}", instantNow);
        }

        for(int i=0; i < testlist.size(); i++)
        {
            logger.info("completion service = {}", completionService.take().get());
        }
        logger.info("[ttes1] after submit ...");
    }
}

class callTask implements Callable<Integer>{
    private static final Logger logger = LoggerFactory.getLogger(com.refinitiv.timeseries.snapshot.callTask.class);
    private int req;
    public callTask(int req){
        this.req = req;
    }
    @Override
    public Integer call() throws Exception {
        logger.info("[ttes1] req = {}", req);
        return req;
    }
}
//
//class ttes{
//    private static final Logger logger = LoggerFactory.getLogger(com.refinitiv.timeseries.snapshot.ttes.class);
//    private ExecutorService es;
//    public ttes(int n){
//        this.es = Executors.newFixedThreadPool(n);
//    }
//    public void sendHttpsPost(List<Integer> testlist) throws InterruptedException {
//        Instant instantNow = Instant.now();
//        // logger.info("[ttes] [sendHttpsPost-s] time now = {}", instantNow);
//        Iterator<Integer> it = testlist.iterator();
//        while (it.hasNext()){
//            int req = it.next();
//            es.submit(new testRTask(req));
//            it.remove();
//            instantNow = Instant.now();
//            // logger.info("[ttes] [sendHttpsPost-e] time now = {}", instantNow);
//        }
//        logger.info("[ttes] after submit ...");
//    }
//}
//
//class testRTask implements Runnable{
//    private static final Logger logger = LoggerFactory.getLogger(com.refinitiv.timeseries.snapshot.testRTask.class);
//    private int req;
//    public testRTask(int req){
//        this.req = req;
//    }
//
//    @Override
//    public void run() {
//        logger.info("[testRTask] req = {}", req);
//    }
//}


class ScheduleTask implements Runnable {
    private static final Logger logger = LoggerFactory.getLogger(com.refinitiv.timeseries.snapshot.ScheduleTask.class);

    private int timerCount;
    private List<Request> postList;
    private S3Trigger s3Trigger;
    private Configs config;
    private long expireSeconds;
    private ScheduleRequestDao dao;

    public ScheduleTask(Configs config, ScheduleRequestDao dao) {
        this.timerCount = 0;
        this.config = config;
        this.postList = new ArrayList<>();
        this.s3Trigger = new S3Trigger(Integer.parseInt(config.getSendRequestThreadsCount()));
        this.expireSeconds = Long.parseLong(config.getExpireSeconds());
        this.dao = dao;
    }

    @Override
    public void run() {
        try {
            postList.clear();
            // Check to refresh IRPM every 1440*config.timerMilliSeconds s
            if (timerCount >= 1440) {
                ConfigUtils.refreshIRPM(config);
                timerCount = 0;
            }
            // Generate expired snaptimp
            Instant instantNow = Instant.now();
            logger.info("[ScheduleTask] [Timer] time now = {}", instantNow);
            Instant expiredSnaptime = instantNow.minus(expireSeconds, ChronoUnit.SECONDS);
            logger.debug("[ScheduleTask] [Timer] Current expired Snaptime = {}", expiredSnaptime);

            // Get snapshotID which snaptimp < expiredSnaptimp and s3url == null
            List<ScheduleRequest> requestList = new ArrayList<>(dao.findBySnaptime(expiredSnaptime).all());
            StatsdConfigs.dataCounter.increment(requestList.size());
            logger.info("[ScheduleTask] [Timer] scheduleRequest data size = {}", requestList.size());
            // Send trigger request
            for (ScheduleRequest scheduleRequest : requestList) {
                logger.debug("[ScheduleTask] [Timer] scheduleRequest data = {}", scheduleRequest.toString());
                String actUrl = config.getS3TriggerUrlPrefix() + "/" + scheduleRequest.getId();
                logger.debug("[ScheduleTask] [Timer] actual url = {}", actUrl);
                Request post = s3Trigger.buildHttpPost(actUrl, config.getIrpmToken());
                if (post != null) {
                    postList.add(post);
                }
            }
            if (postList.size() > 0) {
                s3Trigger.sendHttpsPost(postList);
            }
        } catch (Exception e) {
            logger.error("[ScheduleTask] [Timer] exception found: {}", e.toString());
        }
        timerCount = timerCount + 1;
    }
}
```

