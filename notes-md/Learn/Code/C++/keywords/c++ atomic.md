#include <iostream>       // std::cout

  #include <atomic>         // std::atomic, std::atomic_flag,   ATOMIC_FLAG_INIT

  #include <thread>         // std::thread, std::this_thread::yield

  #include <vector>         // std::vector

  #include<chrono>



  std::atomic<bool> ready (false);

  std::atomic_flag winner = ATOMIC_FLAG_INIT;



  void count1m (int id) {

    while(1){

        if(ready){

            std::cout<<"hello world"<<std::endl;

            if (!winner.test_and_set()) { std::cout << "thread #" << id << " won!\n"; }

        ready = false;

        }

        else

        {

            std::this_thread::yield();

        }

    }

  };



  int main ()

  {

    std::vector<std::thread> threads;

    std::cout << "spawning 1 threads that count to 1 million...\n";

    for (int i=1; i<=1; ++i) threads.push_back(std::thread(count1m,i));

    ready = true;

    for(int i=0; i< 10000;i++)

    {

        ready = true;

        std::this_thread::sleep_for(std::chrono::milliseconds(1000));

        std::cout<<"sleep 1"<<std::endl;

    }

    for (auto& th : threads) th.join();

    return 0;

  }

