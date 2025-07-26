import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import dayjs from "dayjs";

// Paste your base64-encoded PNG string below (strip out `data:image/png;base64,`)
const ristarLogoBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARUAAABCCAYAAAB5EkIZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAEMhSURBVHhe7b13vF1Vnff//q619j7l9pseAoSWSO+gWABFBTv27jg6jmOZR5nxGed51LGMZRzHUafqWGZUwLEDFhBEAUGK9N4SQkhPbm47be+91vf3x9rn5uYmQIDEwed3P3nt3HP2OWftVb/r25eoqvKHhp3VWOOlBoJAACxgZn5vFrOYxR6F/EESlS4F2e6WADL1Ust38c4sZjGL3xf+oIiKqiIiKJ7IiwCqJXmxIBZRRYhURWVb00RmycssZvH7wB8UUaEkLKo5iC/fgwgU6hCxGAXxASOGMI1VMWZWEJrFLH4f+IMkKnkoyIwnCS023HI5/bUeqsOLMH3zwPURQkIFQ7C6HVGZ5VZmMYs9jz9IouILT6FK2lrD3V/7a6qNFtI/h+GjT6L36GdT9OxFCAmJKCLxN7NEZRaz+P3gD1ImMMaQoITRTQy2R5jXXE/PpvvZcMV5jN50CTbfRMf4KP7MYhaz+L3iD5KoZOJpu4zNjfVkOoY1k/T7BvObG9ly5Y9p3XstFd+O1h+RqWsWs5jFnscfJFFJtKBWZJjRSWqZI80r4GtU1DDUGmf95ZdgN2zEhD8oyW4Ws/h/Ar8XohJCaf6dgbCTa1cQSJAih41rcEFRU9CuTJL4goSMnnX30llxM+o7D/vs6QghEEKgq15SFE+BakCDUqjSQckhGrO1a87evpxZzGIWvyeiMh2qum0RT3NjeyzrU8Ug6mltWY8QKGxB4drY4AlaUC+a5CNrUdEpQvFYIKrYkKPaodAW4lvYooMn4DXWexazmMXOsceJysxFHf1MHt9i70IIaHMMbTZwQfEiBCQudo16lLHRscflThvrJnhfoSGOjnWIqYAmBA3buJRZzGIWO8XvhahMv0RkyhFNd/JvVyAUFBNbKMZHsaoURkpHN0GJzxDz2J30u3UMAoU1VIKSb9rA6Pq1JS/12MucxSz+/4Y9TlS6mK63mP53+qW7rFj1dBpjmDzDBiWIQbez7igDA4PT3u86VBX1bdLOgyTXX8Dkd/+R8avPAb965ldnMYtZ7AR7hqhEbSZR+yCIN+QIkgvqA54WRhuozyL3gmCUaK0pgBBAi0h4ZpZdoj26hap2sOS0rcMWPbQTxUlBy1rsvD7UFKgJU1HLAegABQHI440CUKFA8CgSxvCbbmXk4m+w4cLvMLD6JtyDN5JvXoXTNhZiGDT6GFTLexgzlVMKQXdUgu8qyd6teDLX7Qlguzp32zZtVvjy2hXM7Is/xP6Yjj1DVFBAUAQRMBJQGUVbq8k23Upr9bU07rkcVl5JsuVObGcDYjK8FUKZukDFI+KRnS7cgEsNheaIFCShIC0s3oBqIEuq2OE5kesoh6c77k5BFDyGXCC3ELTAFpOYkfuZuPY8Hvrhv9K+4UoSJjF2EjOxhbB+I4YixhZREpUnIAntDt3SFLpS2Yxr5np+Ini89Z0p3k4XdLe7Hmf5jwe741ndoe/OMUXxxI00tu6xTY+Z/bE7sDva+XiwZ9z01aMYAoLxHYrJEfJVl7L1yqvobF1DoRnVHJzLadX6qR94BHOf8VIY3h+kjpeAqCclJkgJmsC0oMAQGhQrf8vKH3yZJRMrSeggRZ0sKehIoDN0GHPe8H9g7r6IJBjc1EpzXlEDuQE0ICHgGg8yftvVjN58BfX1d9KfTaLeMVF3GB2npf3MOf1dJE99EaK9CBZju8Ru1+jyzG6e/v6xOuZ1v7+tDN2BawoYdMa0NtMmercM7z06Q9e1Y/nb3AJ21ZGwW6annNjlfTP12+3LiNHlEVM6tz0wNZm22B6uLTu7x8wx0y4BUDwhGgqMYACr8e/Udx+mvC66nMn08qeP1a5i5nO6aobp7Zz5nT2BXVsRjxEqpcihCnjuuv133P/z86k/eDdLJtaxuLWF+Z1x+rIJBsYeIrv1Cu778X9RrLgJV4ygRQMVQdVA2H4iR1O0ozJnCXbxAUy6HmwRyQYaUOPQSh+mdx6YBDO9D8uJ4FHEt0lamzCb7mX9xWez6bLvkz50KwPZBKnPsRJIi4BTQ2EtWkmnFfT40J3MMxfL9PuP5ZpWAkox45qaqlPXzN9PL2Pm/ZmXMWa7xf5IV1dHluc5PpQLTgARcu8pvCeEeD3S3jyz3N11TSeaM69Hw9T3fJTjVKMfk0fxqqiCaoif+0cvb0c8/Fg91mv6RtG99/vAHiEqoWQDjQgiygEHLWHOwjmQdMiSScZrbbbUCzKt0F9kLG5sZNGqm3noR19j7K6rqOSTWDWgFdAdF3NBQtG3mEVPfQ6TtTkodSjiBFWTkA7OJ3d1/E5ofcsJmQHnG3TuvILV3/k8lRt/zt4TK5nrJwg4JpM+WomhmjuqbYfvHUIXzptZ1P8IdCcK7qABZMb1MAuVGWXsDFOK8xmcysx7jwZVpdVpM96YYOv4GKMT4zTaLVrtNoX3iOyR6ff7QYjcSvmSyU6b8eYkjXYTpnFdvy/sdF48jjHbHdhD4k/5V0C1oPA5ZuQ+Vl7wdXoe/B1D2VZSYNJVqYQmTnMClo4MMFnfl/oZL6JyxCmomYsrEqxTgrHk2Lj/BjDBUwkTjF59AROX/oBeHacvW8Ok7YFn/yl9p7yWIA4rJiZw0phc0hQFhc1prbuZkXM/z6LNq1DXxJMQsAiCKFhV1ORsSvsxRz6XvZ7/VorqXthyMhkx2/QXu4jpu4UGZaTT5u+++nUCFRJNcZWAVHoRm2DyDvgWLQnkApkvwHjyLCf4ChICkheYEFi8cJgDD9iLpyw7nL3nzaMXT4HHYqiqjbllDOAV1cCoBv7tnG+xeusItbSferVGYhLEOoIIYgxFlhHyDPGeIi+oJm3e89a30eccVQFRiYlsQgevAW9rZCrkReDOVQ9yxU23cs1td7B24xa2jIzQbrcJIdDT00NvX51FCxdzyNL9Oe3YIzh66d7U++tYlIqCmEBhAp12zjk/+Rl3rtlMb32QXpcSahZrBJekJM5hncO4CpXEkziDSkIRDHnWgU5OCJ6OFuR4aGdoq8DngcnC0wkF48UkZz796Tz/iCPxVkEV9zC5d7YbPxVMDkVQrlhxDx/653+iUwT2HR7kHz/yf5hbT3AoTtNHj5APkbvJRGmp5/xf/Iwbb74PV+lD04SkXidYQ0+WUYgjUwHfQToTZKFCQMh9VAy3iwIvTRb1DXLQkr04+pCD2W/vxVSsUNMOBgWbothHrtMTwO+NqJAL/oEbWX3evzFnfCW1bJJQSUm0gVCQG0tOnQ4DjAzuxdKXvQVZejSZ9FA1DhFAI2uICh5ByHDjD7Hlml+y5rbfMDy5ArEpQ899Gz3HPhtve0GS7YhKoI0rJll/0bn4689nuNhCU/oALVXLYLWg6ts0XcrW4QPY6yXvINnnGLzr221EZUILNjWbnPaG1zHSzPAFSKVKRqyvhAzjO1jnyIs2LjGEkGOTKp3c4KzFFx4RcCFQxTDYM8Cbz3wx73jli+mpV0iMo6KCoSQqQQlFwYSB173tj7nzwVVsdTV8UDAJuYJiECM4EVwosN5jVTlkuM73zzmbXuuoGSmJikFDRoHSlpR1Yw3+5Rvf5LyfX8hkXuCNo7ABrEE1cq4AWnisqeI7nl6BZQuGeO+fvIkzTjmVmmwjKlvV8c4PfZif/+5mVAXnC4Lb1pcgWCxSWILtEEQJJECCVcVpQCnwDrz1JIWSBAtYWqokohinfPJd7+Fdp7+IUOrJdoWooEAhtBX+6otf4lsX/5xMhFqR8Z9//3c8++gjqAJgHxNR6QTPJz77Kc79+a9okBCqVdqAWovzOUEcGIfmTaraJoQUrwI2AeMoCGhFcT4geaAnqXD6M57OWW98LYcsmY8LOdbVwNiZtdhtsB/96Ec/OvPmboMQhSENTCRV0v5B6v0VNq25A+dauCJFggcx5MbhxdCjOb2NFo1NI/QeuD+deg9GqhhVDDk2ZEAgGEthEnzaS33f/ansdxidSj+jyRz6Dj0FN7AAxJQSnkE1koyWaZJuXk24+If0ttfScW2sT6mGJhVaGAqCKLmrsLm6iOGnnUnlKSeTJf042UZHhGlvHgckQM2lPP0Zz+DYE48nrTluu3c9wVQpTIq3FjWOxCc88+ijOGzffTjiwOXsO38JFXVMjE/i1aBpBW/rNEONVnDc8Lvr6a04jj3qcAyKC1E5GgCRGMYgIjzrmc/khc8/ncMOP5bRsUkeWL+JYKsIVbAWcs+hBxzAe9/6Vv7sj/6IN77kxQz39pEagy2brWIJIjTUcM29K3nPRz/NRb+7kVaIO/6y/Zbyxpe8iHe/6Q28+cyXcfoznsHBey2hp5Kwdv1GCpOSiWHD5DgH77sXzzj2GKwqIjpFIH5x5Q3c+tBGjCj99YRaGollNUmppSm9SYUeSZjMCjKb4iWd2kRqLmGov5fEQtUIVZtQsQ6MpRDIrZJLwZnPez5HLNk37haiccN4FKgouQj3b9rCp7/yVbZkOZ0kASvUrOWMk56OLQDz6FHyU9Ywja8OP/QwTj75Oey7z/7ccuc9NPOAdykFFi8JKpb9Fi3guMMO4ciDDuaAfZbSW6vRmmig3lMEJTOOIqnQ9o577l7BrTffxCnPega9aQVro+HiEar0hLDHOZWgBaoF7ahxJc23kt95MauvOo/htaPUaWF8hmIpjMGQkXgYTfppLz+exc97HTJ8aLRlaNSbdMSSmwTnA843scVWsrExbGMTvrDI0uOZTKvUJIt+JRp3J9TQNg2qd19D89y/p55voJ1ALbc4bRAkMJH0Me4G0Ln7M3DsGfQd8iyKnjmICFbKBVUyTI+VqGzX1Vn84w20JLBq8wZe8o6/ZsNEi7YxYAoqwTMcUi77/n+woCfFWUceDL5TcNP9K/jsN77JVbfeQsumZK6GBKFetFlSE879t8+xbK/FVAI4YykMCHlUZqshqCGokGP59s9+wV9/8UtkUsWGhMJk1HzOh9/zTt525gtIgmKsYNDyhAJPCIA4Ouq5/v4HePuHPsGqkQmCMwxaeM/rXs0bX/JCFtRruBkTuK05tz+0jn/57/M5/+Jf4iXwrU/8X8448QQqqiCewgQ0Tzjr0//ENy+5go+87+0877hD6O8dJE0TnDUggiCsfGg9b/jLD7K60SSIYEIg8fC+N76eP3v9y0kIqAR87vFZwWizza0PrOQDn/00WzqT/Pfn/pEXHXxEzBTIrok/EBjz8KVzf8Bnv/FtOkkFbyP3vN9ADz/+whdYNmcuzuxagjBVLQ0bSgjRd6sdhDee9UEuv/V2Gmk1qsowVEPg/W95De9+w8vpFYtXyH1g08gY3z3vJ/zb97/PiIHMOlyRkhSKMW3+4o2v4AN/9EaSANaYuOfuAeyhYndEvRMwvkrLLqS67KUsOelPyOtVcpugakm8w/mEtrW0Km1sshV/33Ws+un3aY+uRzRHMXhJ6UhKoYrrNGnddQN3fe8rPPDtz7L2W59ly+U/Js230qOTiOYEHxVVXetFVStkWUbTtDDGkOYpbemjZQYYc3PZWN+P2nEvYd+X/SkDxzwf3zuPxEDSpQJPAN0dS0Rop4JPBWegIspwtUrfQA21BcEWBJuTuwLpsaQVpZq2SWyHmoPBquXEI5fz2U99iKOPOwxjM6y2EAq8GDZOtLnit9fANPMsQJCAmMjep8ZQxWCtMrigh6Zr00lz2oknq+Tk1YLe4QqYAms7pCIkYkqxr9SnALnC18/5Dqs2bqZIq0iR84aXvpj3vO6VLK2nVExAEhALagM4pYcOxy2Zz/9++5tY0FsjUc+c4WFMmaWvi9xmFJVAWneceMQhHLL3PPYd7GFRPWVexTGv4hiuGCr1QJbmZKknT3OySka7kkFSMFSxzDGBeTawqObYq7/O8r3m8syjD2H5/IX05sKcel/kvKbth48GHzybx8c557wfESoVlATnHSqO1SMjnP3Tn5Ht4urScm4YEaxYEmMRcowrWLh0LlnaIXNtclfgbQ42p1ZR6i5QoUXNdOhLAvstGuTdb38db37Tq8lp421O7jx5amm7lF9fcx2NLEeMiZqEPYRdbPZjxLQd3IhDSGlXejDi6ZUCSRIqB52AO/E0VlYStvYExI1SzccYbCX0tqvUOtArk/SuvgS97J/oFG3W2yod9aTFGDXdTL7iUvSn/8rcFZexoL2S3rRNu7cXXx1GQ4VqVqfqPZWwHootFBroGEOr3oMvariGYkOBY5TN1QFGlz6VuS94B8Mnvx4//xjE9VKRKLcbqU55uyCP05FgGmoaHfGCKMZYatbRm1bxZJB4BIfRGjihHhwSEjJxmGBQY3EEnpIknPWKV2F9gQ3RlN92BRN1z51rHkStRY0HCbhgSLSGoRb1TMZCYnCipJqSFHWMr2LUIFpFi4Ra2kuKw/pSpzV1OYwRVAL3jIzxk+tuw7gaSdGht+547emn0ieKWosxjoSoo0nFkmAwNgFnGaqlLBnuJw0w2FNDRQnOgElItIINimtMME89g7UKQQ1i7LZLIgdQwVDJElxWxRQpUqQkRYVqmkRHyjQFW0NtiiYJKtBrHfVqFZcr9UpK7pQkFCQ7G9MpzrRATBsxTdoWbrrlDtaONmkbMOQUEkBTjNa5+KJfMTrewKuhIOAJaNdddga6jxQpRWojGCwOR29lAOMrEGoEtWgwkZMpuR9xdYytYowDH6gG5Y9PP51lA4uo5BVQQ24KCic8tHGUUHqDyy77+z527BmishNUfMCFQFDFW0uo1Rg+9lUsfsabGJtzBGsq8xmt9dBxkJmEQnrxYYgJs5SNk3NINj3I/OZ6qqKIVJDxUVZe91uY2EDFjFHJ25hC6OkfwJiMSraB5spfs/qK/2LFxd9k9Ppf4NbcSb0zTk8todM/wNbeOpv7KqzZ93jmPP8N7P+StzC47FhC5fHFDT0eiAiqSpIkJGkaB2TKwhBIkoQo/+4424NXDl5+EMPDw1P3BEgwUIRYTres0sN2JoIGnHMzyo8WoDRJyiJ2/GV3nV16+eU0O61YfggM9w4wNDAYldlh53S3a3C1QG/i6E8sFVdqYKfBGsuhy5Zx6kknMG+wHyu7R7koGJI04enHH8dpT38aA/VaN8b94SGgKoRgCMHSDMLZF/2MIEp/JQUybHl0TEB4YP16fnTRxWRlvxuivkZ31iE7Q8kN1ur1mZ+gCmmaEnZCoaw1zJs7h6VLl27HjVhVjE7F8pd+THsGvzeiYigwEq0mQaLCqd27N3NPeDUHv/qD9J36ekaXn8DKxftw37wlbNj7EPxRpzLvpe9g7+efyYrffI91V36bLFtPYYXWhjX4DWvo8U2sTmJ9jnpDdWAOoT3K6G/PY/0PP0969Q/pufoisp+czei3v8Sm6y6iXhHyhfuzdv4ByAkns/iVZ1E95oUUc5fTqQyTm2gG/P0h7jyJc9uJFgDVWi0u32n34rQQxJbR2CJRHg+KU0E6BUsX7YX4qCRXFF86I870YRAVnLPbEY74OoqMlPN7JoQYTnHvihWoEYIIqhCKgjyUO7NXdCd+Et3gz/5qhQ++99184aN/w9zBgR38ZjQob339a/jsRz7AcE9tlxSosI0oUwZUzKQXimKN4T1veQP/+plPsGh4KHrIysOwn91bavCFBU25f+1GfnvP3ThjOOvNb2aoN4W8E4mKs2RJwrk/+SkPjYzGx5eey49CuqbQfWS1Uik3lW2fTW020woLIUQRyhiMgVqtNvUbCQEpchbPmxt1KRIQs6s1eezYxVF64gjWoyZOGhssSXCRZTRVtH8pQye8gn1ecRYHvuVvWfaWj7Lvq97Pwhe8jepTjmVk1Y0UD1zP5O8uZOvVPyPtbCCRNkmRYUNCoAePoamKGxxizc3X0bzqpyxub2JocgsLOuMsbm9kztjdrL/2J6y+7QYWHf8Clpz+Z8w59e244eUUbg4FFShjlR5NY78nIKXicTqSJI27y0xuQUDE0G53mJicQNHIHXhluKePZz31aSTGlO7kSiHRKXEmolgTuaUuVEvXY2J80876QUuL0tbxseg9baKn8vqtW/jhJRfStkKwkTDMRBBBRUgFjj14Oc898WjqabJD7ZwkJBqoaSBRZXvn90dCZA+cKc3+5SKdakfZ5ipQD56KKqZbr+3K6SI6E6oKziaEwnDhT3/NSKPF0Qc+hbc/79mccOhyUglYI3hRMmu586GHuOz6G/EeRAMqfrsD7h4R5dfE7MRKI4Kx2/uZdF8LQvCBrSMjhNLj1yLYPOeEo4/A2XgY3y7X43FgV0fpCSMzAV82xAbBeaFmRklsQSEJnWSYoro3pnYArvcQpHYAGfMoGh3at17Noslx9mu1ya68gubdN1PtSUiTFAkVCu1BXUruLEm9zqYHVjDYHqMjBa1qQsspnUpGMxmj7sfIWw36Fi6juvdxTNp9sIXFBcFpIKGD2w1K2d0Fm0TRZOZuDyAoN99yG3meTy0eg3DSiU9l2f77EYpIxB9O9HmiUIFqvYaWa0CcxTvhq9/5Fj+7/Jd0QrHTjb97U1AcivUB2Vn7jGBFsOrj5zt+Zeco25vYR57eEgI2lM9+xLLLDzVaZsbHm1z8s0uwLuXFzzmNuSbh5BOOxaJl6EEMfi+M5b9/9GPanU65KUSu8YnCiGBncNLdTTAvCjZtGWH1Qw9hSnO2Bs9Aby9nPO+5WCt4LXau3NlNeORe300wxlCll0RqGJOAE0hAZB7GpKROoh8BhtQKLjWYREltCze2Fdavw1e2kjNOf+chtv7qa0yMFVROfi3r5iT0+DES79HKAM4JprEGxOPpxWgg2BZbqvNoHfwqhl79IfZ/ztugZz7eJSS4KJZFlzOMWgwGr54iFFOXD34H0WFnC/2xIk4Gg7UGqSSgDlskCIFgOiTOETTGQXkVvPeI7xBCzg0bN/Cls3+AhAEQS01bnHbUAXz4ba+j30A1TbCuhpWUGtGMWKB4iYmogoBRqNgEKZdOYcBqvE83RcHOZkkQkmA46qBlWF8Q1FFIlbbUWDOR8Oef/grP/bMP8J4vfZm//+6P+e4Vv+V3d9/N2i0bmMwCWe4IHUFzwahBCQTxsX5dIiUCxpSOXdu4ju0hRJbIgLroPiCWoIFEDFZBjCGUQWAGSOlavhwkKWItxppSNNjxIR0sQRXRnEkb+PdLzuOmdoPl/YOc+ZwTCDbwqqedwuJFA1SCx2QWG3rJTZ3rHlzBb+6+jw4VTCG4hwmNmA7VqHtRVarVKt7HXENGEkQSvBfSpEZQYVKh8B6KNkWWM5oFPvqVb7O63SB3BabocMTCufzzX76NI5YuwKnGdRiia96ewM6my5MCXRNwMJ6mtOntKH2tgmpoMnfTJkZ+8mNqvUrtBW9jbM5LecAdy9ahIzD9ezPQ049iGGoaOp0lrN/nJdRe9T4GXvNK5i45AnUDYA1CgaXA0EEoUISClEJTnLfbXeZ/4hAhVWpiqJjovBdwFNYyScLld9zLH33wr7lt/YMUocGBFeEz73wb3/jbj/GUhXNJ9iB7S+TAMQLPe9YzWdBTIylaGC2AhIKUyeC48f6H+M8LL+XDX/8mb/zY33Lq+8/iqe/9c05957t42yc/ybeu+DX3jI3QFHAhoVY4KiHm1in+B7r74dB19gvGsHF0nB+f/3NsnnPqSScxp78PUc+8oUFeePKp1AAnWsZggVfhgksuoSUQjC0dMp8YjBisjUpr8dDBMGErPJDlfPTfv8JPL/0lppPR3yl4w9NO4uzPfprTTj6VRGYK13sGT7yFewpl3hLXWycMDOJNHUIFCiVPJuht3kbjV9+jb3ARg294M/POfCuLjj8dKsP0LdyPkWSI9f0DVI99Gvuf9hpSN0TnwTU0162G5hbET2BNUXZBuTeWgWAq0LF+6spcoJih2NrZjra7ISLYklHdPD7Jjffcz8XX3Mznvno27/zQJ1mxaRRJU0571tP42t/9LW994RkMCZgi28ayPxq6h97v4te3gypL583lZc95NnXJMb6NhGgiz9RQJFV8bjBFijU9ZL7KupGMO1dv4MdXXsVffv7znPmu9/D3X/8Wo80OBIN4QTVQ7KrJM7I0UZiaFqFL6ffxeEdpelm27JvcGC6/+nesXrOJuhhOe8bTSYE0sVhVXvHc59Gfpoj6qD8x4L1y5Q03sqUxSSGG4B85mHNXYayh3Wpz+z33c+1d9/HP3zufN/3lBznn5xdSWMdxRxzJx973v/jC/zmL/YYHqWBiSoZSlN4dYtjD4clLVOI8wdWHGDz4JFbWFrK1vohChumYKjU3Rm3D3ay49X4ac/amfugxzD38GLK0l74jnsnoIc+l+tLXkBy8H+t+82PWfedLjJ3zJVac80lWnfdFwqZbQDu0VchMgscgCIkqzucgDZRJlAZKAyRmqdtu4u5xKJX+HjrO8v2LL+KV734Xf/Lhj/PF7/yIdW1L0CrDaQ9/9Y63c/iyA6kai6ghuMquLkkou/oxQ6JOJPWBd7/p9Tz18OXUpUOlaJKGLHrdSojGLB+QHFzuSPMU66sUUmPUpqzqZHz+nHP5zH99i7FSLEPZdZOnUKZR2F5fIVOi5eNq3dRvQwiIj96ujRD4/k8upPAJhy5dytFPWYYjYNSTiHLIkr059fgTowcvHq+eII5Vmzbyq+uuI/Nht0RmBw2kScr9993HW97/Xl7znvfxqa9+mxvvX0vbpHhjePmLX8hrX3QavRXF0SYNQkUstvTt2VH7u/vwxFu4Eyg+5pTQrtUixB1FQ+kmXqqJyo+777sp+FQVT5lPxVRYdPSpDD3zxWxatD/jvQsJsi/Z0FEkz3gxwyc9n4FmPxocmTNkJoE5e/OUl/4xyeB+3H/ZL0nuvYKFnfvpyVZwwOSdJPf/mnt/+d8U4yPYIGQ4cg2EogEjqynuuZ6x317MuksvYMtVv0DvvQm7cSXa2ormDTTkFD6mu1TC1D8NZZsfN8oVVYouimASi4rwvDPOYO8DD6ChSuEqFCZB1NHcNMo//8OXGG+1wRq8CG0Ev7OhLTmxqTCDsqozazztI+h+fwa6u53RggX9df75Ux/n0391FmeccDT79FXoMxmpbyBpTu46FDajsCGqwBVEDUhC5oWiUuU/f/ITfnrV1RRl5XbV4imAD4Gc0N2HplrQjTjfoUG7gO7GISLgA97Ddbfczh1330OaJrzxzBfSnxokRMuQoPSI8qZXnUlP6hATH2nEEmzCl88+m83NRjnho8o2lHlTHn3OdAcqftcCzggHL1/OS1//KtrO0MbFYMpg8WL49699g1vuXkGmBTjBUHJuXUL7h0ZUfIyVLIP4QPHkXcVmuaPkxFylcXJ60JxAQSBHaZYLQ1DN8ANLWXjCazng1X/KvDe8nTl/9KcMvPIvqD/t7TA4n6ImiAEbPNVQUNGAdYbxa69g/ro7Gcwn8VrFhCr1bJR5xSTJ6vvI7r+L3naHmnZIGusYu+kXrPze37Phu59Ef/4lksu/TvGrr7L6u5/hnm99ggfP/2cmb74IRlfiwgTkExT5BB3N6MBUkp7HDbXliisAELXQyhnwsE+1lw/80R/Tr4GqBkJnDC8ZHWv55Q238t1fXkrHKCKeRKPSeSaEqIA1pXHWAF1z8vQ5FtN5xh+YhyEqCASjSAIuZCxKhLecejLf+NiHuehr/8rPvvwFvvjB9/D2M07mJSceyUFz+uizitMCn7QJpoPkYL3DBmgVyrk/Oo/JdgtCN5p411AIdFKDQXBBUAtWlMTaqXbu2BuPjOkcjgJeDD+6+Eomspx9li7kRScfS2oENS4G+akAniMO2ofjjji4dA2w2AJ8SLh14wbOv/KycueM/qyRm+yqpXeO6QKchAKjBU4DdWPodZY/ec1rOPbg5VSDpwokApnCfRvG+fA/fJmNk0qQ6mPvgCeA3RalPF0sKKZUoOWEVY8XxeQNaG/BtEex7XF8axU6uRYdfwjdugrZvAJdfyvtkZU4p6y79TcUd15JfscttO66luz+G+k8cBsT993J5K03s+G2a+k7cB/G6nOoFBn10MaIR6wyMbaV5tUXkEzcS7sq5NLDQCbklUmSjqdS1Gj2LqTnKcuhvZ6Ri35I66qf0zNxPzUZYbg1Ri8t6kWDvtCglk2gIxuYWHk7W+++iWz1HZhsK2mipNZCcBQkiDXbZ5t7OHTnUTcptwa+c8mVPLh+Ld6WBQTloH325eUnPQ2XCsMLF/DAqrXcvXIlRd1R2Jh1LIhw36oVnPHsU+mv1EiJOUd2NpGmdt/ue5QHNo3wnZ9fjLdJuYMpqQZe9pxTWLZ4EU4DMiNUXroWokD0UMVixIK19FSqLBoc5Ij9DuC0E0/kBac8k9e+8AxOf8ZJLOytM7J5PVtHx0FKT15RVJTmyCZecurJzBnoR0tz8qNDWLN1hG/9/BI6WayYt4HEK2c89XiOXnbgVDfsSnHT5zF002gK6xstPvX1s1k/mbHfssOoVFLuXbuROx9cy52r1nL7mvVcv24d1618kPvXbOCBBx6AqVgmISQwvm4drzztudjEEURxIt1MzjtWTuN5VtfddS+/uuY6chtTqgrgioKXP+9U9l88j0QShgbncOEvf0luISMg1uGMZXTLFub193LUoctjXFVZrnY51pnP3E3YbURlOkI3M33RJm1tJFt1K5O3XcT633yf8WsvYPyGXzB2w8Wsv/4Kxm64jIkbrqB54xVkt/yG4rbfsvruexja+0DWX/VL6ndfRn3V9STrbsNtvJt08wrs6Abs+Bh5u8HwMcdAz1wqWo2WBydoKKiJ0Lf0WCrLjmNizv6MmznkmTLiAphehDrtofn0LT+ADVf8BLn+UhY011PVUYJVVHspcHixeAQXPH15k5pvUGltgc2raK/4HY07r6Vz3100x8aozh3GVOpxcT0auhxt+cKHwDkX/4YH160hlP4VIsKShQt4/anPJCXHpClHHXYEt9x+Ow+ObKAwEs2nkjA2Ocm6NQ9yytOeSs0mD0tUZuoZHi9RQaM029HorSsBEIOxglUlxeACJCZQNdEdf6/hQZ559OE87zmn8uDqtdy/KrbVm5hKQJuTvOaFz2fh3DkgZteIiirrx8Y4+6JLyTIB/BMiKkxbbCEEvPe0neW/L76U7//yMkxaYc3qB7ngml9zwRWXc/5l8e9Prricn1z6ay69/DesfnA1NnhElNwajFqCUUY3b+H4ww5jyV4LkRCiH41EpfIOKuWgBGO45o67+fW1v4tExcbvJcHzolOfyUFLFuIKYa+F85hsNbj57rvIRLDiYhS5Cg+svI8Tjz+GocEegoboOiEG2H5z2Z3YI+KPUaVCRtpZw8bLv8WaH36W1hXfZviBK5m/7iYWbLiTBZvuY+/Rlew1sYqFzQeZ31nNUGctvX6cWk8PtaEFzF+6H20nbKnVGKn0Mp7MYczOAwJGWriB+SS2hrvvWnTkQaztEMYeZNWl32XVOV/k9l9+l8133c78OctY/tK3M/+tf87QKe+gfcTzWDVvETJ3gIn1q8muv4pqvhlxTVQcGnpo25SOc+RWCFYJRvDGIUCiOVVtMZyPM2/LeuTeOyjWraRIWhSl6PKYMDW2M9hggUarReELhECFnH2Hevn4+9/L/HodE6IXLd5QaI0Lr7iaL3/nO3TMztOjziQoTwyCGsOa8VGuv+ceJgqP+uiZKqKIAbEyldNGpBRJTGDvvl7+5JUvp1pyZN4IwQgmdSTVdMqHZlfhvSd4P61tj+HHM9DtIxHBll6raxsNvnruOah2OPLAhZx2/HJOOeZwTjnqME495ghOPfpwTjnyMJ5/zBGcdtxRPOOYI3nK/vtHS4sTNEBQSwPLuT/7KUX30LuoG9gFlO0pPZG9gVaeEVDyrEPNBv7ibW/i6UccRlUMBI+KobCOlZtG+Mjff45N41sJpRc0wo5EbDditxCVyOJFXjiqWAt0bDWrLv4uE7f8hsXtdQx4peINRisEreK1ipoOatoE26KTNJlMcja4Cq1FS2kNzafvuGcw0TdAv1/P3OwBFuYrmN9ZRc1vZrJaw+x/DM2G5aELv8vKC/6Fzurf4dobaN5yCQseuIwDHvg+fTeezcYf/Qubbv8tzflLGT7uJSw+449Y9tp3suDopzM+0kJsjUbvIJvTHpqmB+MdFW1QC03qvkk9jykv29YxXnE0EkMwFi0qdEw/nf6FzD3qaeT1RXh2zKm7M0yfT6rRxb2rb+oGnYkKrWaDTBUwMZuZKEfst4RXPe+5VLxGdwgxiDgySfnGD87jurvvIaM8tC0UoDH0bGfzN0icZNH2FbEd8Sn1XjOhBDzKJddey5ve915WrFmFtTFgLYYFxOxtXoQgliCWSHIMTgPLlu5Db70erSEhhvwPDwwz0NNXLrYdn7lzCEVekPkcFUU0ZqXTUqTY5XVbQjXGSwHx3GxruPjaG1m9YSMDFeEf/u9ZfP3TH+NHn/gkP/xkvH7wqU/xvU9/km9+5pN889Mf5z8/8zE+/cG/YDhNSEIBVjDeglS58tY7eWhka8wFEUnLzutXiis+lBa0crOmdDFoZzmqhmo9ITHQW0n4wLveyXCaIN6DKgEhpBVuvncFX/vv75NpVEcEjYaFPYXdQlQAVD1iApAT/DiTN/yC5LbfMtgssHlCkoF6S25SMmfIE48nKk9dUcP4GsEM0HBLWLTsJFwySNK/H/s86+2M1Y+gYRfSkD4mq3PYUl2MOeg4Fp7wLDbdeSc9W1cyd81vWHXZTxA3RO+8/SAU+Exo2T6SsInWzT+ntnUzwdUIyXwqc49CBw5m/mGnsPitf07ynDeQPeUUxgcXM5FWyKgRbB9oLy70UcmFetiK2gm8bWFDB7GOLX291J55PO6gA6lRoxLTQj0qQld7GCIpzglo3gFRggHFYIPQbjboqKKSghoKE6jawJtf9mIW9vaRGEswHm9yiqSHjU34j+/9iMkikActFYGl4rx8tkwFnhkKEYoQcBqdzrqfQxRveJj1LRowBLZ2cpquQqNoYyRAiLEqAqAG0ehrYzExhQQOawRrI3cSAohPsIXh4P0PYkH/EM7r1AJ6VChkeUGmGd4UMc7FW1Si1ayrdN7V6OBIKj1BAwUwkrU494ILCSocv2w5y+YtoAeoG6Faxi85UZxADWVAc4ZDzrFLFnHqwQfTkxcUJpD4FBuqPDRecPEV1xNEyo6dUplPQaQkiAJZlsXMyQouRKuYGkeznSEkOM1ifhybcMi+S3jFc55F3cTTJVQhiKVpUv7z/Iu56e4VeI0pKzz5ds/cndhtRGU6dMM9jNx8Kf2dDfSEUZIwgZEmVpqY8rI06cmgkqfYogcfhhk3C5jztNMZWnY0uVTJXS+9B5/IvDPfS/bMt7DxyFew9agzsWf+Xxa84E3oyB3ITecwJ9/CYGec+oM30Lj3RuYddAyTdg5WE6reM+A7uE2raK24mcykdEyFtqR0pEJuq2TzDmL4xBex+Mz3svAtn6D28g8wccILWbf3UazuXcL6yhzG0l6CGIaaFSrZEFvqC1l14HEMv+LPGDjxBYTKIC5En4zHi8J77LR4FVFoTkyS+ZjiUohxH14D+8yby8f/8n30m4DzHaxGM76kKb+44gq+8YMfMRkCWYhBgTueAhShKO1WaztnLJUoUuRFEQnEzkQmYwgiTEy2yHJhrOWjmVsCVjMsbZwW2JLNF43lxkWesn7TKI1mi2A8Sot6yHnVC56PtV3RYCfP3AlUoAieUHjKeNX4DFWKMg7nsUDL/7pZ1q67/S5uufN2rDE8+6RnUDXm4XiLKWjpR/LqV7ycHmeJ6q0AeKyF73z3+2wcmQCNnto7M593FbxFsePiN0ZoNBqIQO5czJio0I/hPa9/PQcumkMlxNM7VQK5gRHv+dS//huj7QyCJdlFjvrxYLcRFVXF+ziIkw/dSzK+nop2CFqQi1BIQi4J3qR4W6FwFTrVCSZqOSO9lo1DQ8x79hnMOfG5FEl/jHUxjnbahznwBOaf+kb2e/n/Yp8Xv5P6wafQabRY/5vzmD92N5UiQ9Qw5LfQ2rCS2rITmJx7AGodJngcngRPY3QLRalsUO2eS2So+AEohhG7F8nQoQwc8lyWvPjd7P+6D7DktWeRPus1bD3sBaw/5DVsXf4a5KR3MeeVH2ev130IPfCZNNJFeOqI6sNafrRMO9BFmGKzFR8CrVabrNNBrJ1iDQToNJpI4shNKc74ggJPTZUXP+1Y3vuGV9FvclzIEQm0gqdpHZ//+jf5xbU30jGOIoTyKNmdH9/QbDa3S/XQZRIak5Pl6+3Pv1aNXE+hypYt4xQh4YLLrmFrHsgUclVUfXm0bOmjVBLNTigYV+WHl16Ot4LRnJrNOeWwgzn9pBOwRmMczk5JYES3Hl2Ht05RQBFw5aO6sUrtVszgH/t62m8ewYHRU2YKJMZa/fCSy+iEAmcdp5xwIqkaTBn9+3AwxhBUOfaoIzlk//1w6pEQXSZycu5Zv5b/uuBCWiaKWEG3xZVtq1sgBKXT6ZRjE72elbjO8izD+xAP2lOD+BjJvc/cQf7ur97PcEVIyWPieYWOpFxz973887fOpqXgw7bDxnY3ditREYmLpT3RQMSRS0LL9tBI+mlqH03to0U/7fLa5AYZ6VlEc+EhLHrem+g5/nRCzyDGOSoCiQScgcQ4xNUJUkVJqHYm2HTVJYQND5GYlMzUaCR9FKKERPADC+g58GByCXgTyKylmdRI5y6mQkEqnqoJ9DioO3DWYJ0gThBHTPws/Wh9LypLj2XolFew36vew36v/nMWve7dDJ/2CnoOPJ60Mp/E1KlKjYpUsC6J+U12Ad4X+KK8fEHhCzpZJxKeafoMCcroZIMslL4rgEog0UDVK295+Ys5fNn+JOVISpKQmRho9vl//zLrR7aSF55Q5PiioCiKqNgsJ7EPnna7Pa1mMdmSc46tY2Nx4vmw3e9UlVASjy1bRkFSfvTTX/CJL36ZtWNNWmpph2gFVB/QoiAUUQTzKL+68RbO/fnPyEI8hXJemvDnb3kjvc5GLmAXFMree4qiICsKxhoNJOg0LjEulIlGg8J7fOEpfGx7tx1ME/OmQ4m6Ld9RVq3eyG+uu4HgLPvssw97zZkXudFHWYca4lqoVSwvfO5zwedI1KgTEqVVsZzz8wu5a90WWqEghNiWoijI85w8z0vCrWzdupWgijExMtmYGPfTaDQJQbGFYIo4ZjHm0nPsUw7kza95BVJkiFGsc9jgKMTxrR+fz0VXXctEtu05uxu7zaQcKycEr4xuXEXhUsyi5bD34ST7HYk98CgqBx1F5cCjqCw7mtryY6gf/kKGjn0RQ0efjl10OIUbjKZEbJk9v/Qg9IoJ0BHFaoPi1stp/fZ85mXjOO/JTB1vqky4IXpPeAmyeBn1PmXr7ZfT0y5QXyPb+0gWPP1lSHUgTtxSJ2AIMROdKCoxQTKAUYuKwYvD2wpeUsSkFNaBtZhSB5FI3FVFpylYdzJZmXFfiqhMHCsCG9sZt9yzirMvuphGEQMbJUSKb4Oy9+LFLFq4kFpaKX0awGAwRkis4cjDDueSy65kPGviy5yXIcQJuXHDOo445NCYWc4kWHEohnYIjHvPgxvGOe+iS7l1xYp4rrT4uCbznJq1HHzQclQMTSNUTWTXRYRclK2TTb7xne+zcWyCjjHcdu8KLvn1NWxttCkwFGrJcIznnnXjDa6+4y6+8LWv84Vvn8NIq0Uack5YfhCf+cBf8PTDDiYRwXazz5ftnAkNSobSBMY1sLoxyTfOv4A7VjyIkODFoRrPhUpQnrJsOXlJJBPnMGKQInIiUXcxrWxVxrOMDaOTPLB5lC9845v87r77CVj60zqHH7QcQsxWn1aTmNKxFFPjaEYzxbhX1o43WT0yyf3rNnHF727EO0tIDcEK3iuNZpstm7cwf8F8Ohaq9R4cUaRsBM+ED6zYNMI3f3g+60ZGCdaRhw4aClzwpAjHHHVkzACnCmJj/hiNepdlhxzCA+vXcfuK+1DnkOBiuk7v+c0117JgyT4sXLSAukuxMSYe3U1Wod2STb/LWnZZN6tjiOagFpF4cFFwacnNRLV2CEqwMYWgEEURa3Zkez0+HooeEpouJ2mt596zv0TvplsZaGyiGjLGbJ1ObR7VQ09j+NTXI32DSGctd37nH6mtfgg3bzHzX/Q6ZPFRFFQi1SdG2Qrgdh/D9ojo9g9Er8ctrRYv/7N3sWmyzeRkm5FSxyvWQFDUByoIJmQM1lMqmvEPH/kIzzvqGIyx8eiNEMg8/NcFv+DDX/4nGlawavEoxgmVvMO81HH0Uw7i3z7zOWrG0Q7K2//iLG56aCWdVkqj06ZwQmaitUO8kAiYrENv4qilCUuH53Dev36FPmPACrlVGu2M7134C776gx9y57r1dDAxtUWRUXFQTx3VSp0ixCNBR5uTBIGqCAsHBvjjV76c173wDIZqFSpdT9+HST/QReYDWztt3v83H+GG++5hIng2ttq4pAefG6AS+8U3cVrQlwo9qWHxQC9f/cIXmTcwRKqGihiSGQmQVJUfXX0VZ33sYzTVMFEottaLthWrnlQzBqqWA5fuzX9/4fPUkqiWj2kzI1HpiOHHv/w1f/O5f4xlZIo3UIiiRhCxmBAwRUGqnpoR6j2Gc7/yHyyfvxAN8Nkv/ws//NWvGO3kNIpALoZMAedRH7BBMUHprdaZX7M89ehj+MQH/5peESoKLkDLwD2bN/P695/Fqq3jdEw8C0myTsy7XOQcNDjEOf/wOQ7cZy+8iVYmsxvWwm4nKjEkO+Z/iIyGoEHxLvp4dBOBiYArwz+jfiNgZEelleIxBAiWwo8TtqymveF+RlbcTLZlHXQm6Rkaprb0MIaOeDZFz1IIlrSY4IGrL0YmN7P4qOXIXsvQMIfC2VI2jY5jglDfDdR5VzCdqHSAzc0Gf/JX/5ssGIw4tF7DWjuVKjCEQKfdJoScwrfJiyYffOe7OePQoxDTPSc37i0bx5v8+cc/wdrRUWpJlaJi8Da6c/eIss+C+Xz0fX9BxThaQfnfn/oEd29Zj9E6LkkwxpAkCc5ZRJWiyMmyDj4UZFmH/Wr9/NPffJzBarW0UEUdTTMoG1otrrr5Fi7/3XXcePttbBoZZaLRotXJcVgqSUJaqTA4NMQBBx3I8csO4mXPPpl95g5TF8GVHKmUROWR0NLASLPBJ/7hczywYQMhSQjGIjgqlV4EByqE0CHLmuRFk6A5fcbw9x/5GAvnzMWpUDEGh9B1XqYcnwuvv47P/8dXkGoPtqcXU6nRm1u8z2i0xsnzBnPnDvO1D/0NiUvKg+Xj8SVGIRPhl1dezT997WtopUYmjt56DxXrSKzDWEunyOlkbYo8I88zKBp86ZOfYsnwXKy1fP7L/8bl19+AqdTwIkglxaYVEidkeU7H5xQh4DXgxic45vDD+T/vex8VIAlKzUNmhIYq/3X+BXz/wl+QuyqJE1KU1BpSI9Ryz2c+8AH222sRIfomEHmvJ4bdSlS6O0w8w7isXCmABqLcPp2tNVPnJJcytOqOGcBUCWS40KB9+++496qL2eeEE+k/7CQ66mh1cvpqCcElFLYGVGMWtzyHia0U6+4jb68hDxn10Ics6sf1DsHAYjJ68bZCfaa36B7AdIICYArK7P4x7aEjmj+nQzXqJULpyu9RRAOpRp2AKzk9VOMBUiJ4FZwxUXQkWn0cEsU9X2AL4pk/qaNttyVoNHTjgsCrjwpPKeOvRDACaVCcKkZiOJyUjms5hqy08mSNJms2bKaRByZaHYwq9bRCvV5j7pw5DPbVYp1M6bVSjnkARLYdAv9waFPgVchV8SpYhHjARpm6UssdS2IsVrDRVmO94nyceloU2CSJgTIzHhdC3PjiMfex33tKBXBB95AzpSoxP3AgWqBEKU80iMeW5N6To2iSkAjxrJ0Ql0Vh4qbWDlE3VZGoZDWl5aoQqKrFqcTnaTSfWTUEAS8xs1yOUid6OhqN+keIHJEvD47PVDHW4UpyEa2AMb1oUabUtFHugW2r9glhjxCVQLd2ZdiUeGyIsQvlXAfAm24G9UcgKgEKaZFvuI3Gj75F2HA3E3397HP6O+DAY2lX51D1RZzixmAkxg0XCrTX8+C5X2XggetxMk5FhUZPgu+ZR+/hpzF49OlIfR4m2XPmtS5mEhUNUWkZJOBC1BtpnBXbvgN4LSeDmCmfFm+2JypxmucQysx1Ysu0hiFyZMbgVemQ4RCqhUWwqLXYac52Wlp1vGlFiwIO0cjNeYlPsqKRc0QI4qac9XwIiAaSIPhybWNslA26xMP72A4bF4lKV2iIJhuzC0QlaBYTVhUa86+IYMtndJN8xzqVkbmlF7TqtrNugsZE48Zu04l3ob4UzSVEHYSA9UWczhoJH0ER48BG71ZffpZ0TefBlw6HkahZkajL0e5YAVi0EDQIRnx0JjQQTPRPcepKXU0BWkRzNJVYyTKJudeA2Gr0EVOPNYKKUojEhaMBvMcaB6Sxz7WIaSVEULFYiZkO47N2D1XZbURlR3SN/QooEnZcuGGaGl26eVhLpReaA4FcDaE9wtrz/omBO68i0SbNRCnmHcKS15zF1uHl9IYkTnMTWekg0BbFFBNs/fW5JL/6DoN+kolKQkILp45RHaB58Mns8+wX4+YdhhpH0LijKJTy76NbIXYVM/soLlJi35SLrptlftsnXUSOInqKdk+ym674jX0dJ0ZcPCrESTQl7UdzqUFixv2y3FhiWUrpxRnVjRI/jwWV34+fxktKD9np96fVqdSf+biXIwgSyrlQfmeKoEh8sHQ3l0eC+m0h1N3aT8nM8a+W2Vhi3HK3lZHr2/atkjsrX3fRnbGxlPh3qm1lHQGMxsXf7bNY/20XpfUmfrCtXUp3jk/3yotK0tis6T0tpX9LrFU8H3MbVDV6Kms5yvHB5e/ivIqbdHnawfSSu3WQ0pd6NxKVmX36uNBdfNtf5U5HgpBuG8Fplymzc3UzdEn5j9K125cHlbfvvQG/4lYSJgnGYzVHt26kcf+9OHRblnWJrx1RnBDqDO5/KHnvIJCgCD7UcDnMKxpk917L2t9egLa3EijoEKZ25JlE4IliZv+4snccBouJCrwZ/6IXamldIrKoUiY9tsZM6z8TWywuThJT7vpTPqxxFKpYUuLvYj3iJO7WyRDFCYfDlr+N5ZcSRXdcJR7kFY9c6Y5jfGZ3DGMyongQmy1bKcYhJgFxZYRy5KoM5W8fjaBAdG83pnxwmW2+TOYQax9bHBn+eL87s6JnL7jy2tnkN+V3Yj/E8XHY2CNip9pJuelMPbU7j2NHgekefBbb2Z30go3vyzLiw6aP2fRx6HoiOyzJtHbGy4jFAYkITrpzpdvb5cwp+zn2SrctDiuu7Pty7U1RwyeOnfXr/xi67VIEjyWIgYktjFx9EX3FOJYMkYKqQK0IbLnnPqohjsvOOkStJV2wFLNgKZlxpKENmqKaYLwyXzu0b7masdV3gG+hxpIZg+6ir8ksZjGLHfGkIipd1iwIiOa4zmY2X30+/Rtuoa7jkRPxgsk9Ls+wkw1skaOy/ZEDWrKGEgy+Okj9sKcxUR3CYOIpiSIEo/R2xlmSbaV56xWYbBIJHi9SHiq1o8gyi1nM4tHxJCMqXSEIXDHJ+G2/YuSWi0jzLWCUQhMcPTiSqLgyoHgKE9Bptujo0WhIKFDj6Ft2FJ3+RbSokzKJmg4dB0ECSchJVt6BGRslLTX0j+YxOYtZzOLh8SQjKkqB0iGgEw+x5ZpfMLfdoIZiCwNUKHCoGppiKOYMxEPAVXAag6q6yrHoTq2kAagvJp+3P0nF4rQTzwLCIAQsHTqtEToPPYBoqeV/HClRZjGLWUQ8KYhK19yqoTSNhYyRO35LsnkVdZ9TIIgGLBlIg8IIzfoQ/QcsB5vGc1DKSyQeLm5FEBPVhEKdeYccy1gw0bRJQBAKceQmJfUdNt12HbazhUL8lIl1lxSHs5jFLLbDk4qohKJAQkHaGaN9/y0MhEmEgo5JweQYaaLSYmulTs/BT6X/oGNQKW33XbPfdlaWUtfvEvqXHMRE/960bQ+FVFAFbxLaps6Az9C1d6Ib7sLQ2OGMn1nMYha7jicFUekSgWAMGAeTE/itm0lCFnUsPiYsUgyZqdLsX8i8404mJIP4bjBUN6PQdJT+DAHQ+gCDy45js/aRpf0gglEfPRHpUO1sZvKBW6iQT3mjzmIWs3jseFIQlS48hqY3SBBMXiAYghoqweG8wVOjaYcZPuQkGFpCYStT6RC7nMoOKI8JKdIeFh7zTJK9j2JMewghkIY2ldCiMB1qTDB6300wPoJ7mKJmMYtZPDqeFESlK/4kYnChQ1YJ+GQYH6p400HFkxvHqPTBXkcyfPQLoDoXESENAQldt6YZEGJ+UNGY4X7oQOY899WEg45gvF6jcDGZTiY1HIrZuI7WA3fhpdhjCWxmMYv/1/GkICpdCEriLK5axfUNUhCoSgMTRmknlubAIhY96wVI/yJEktJHsWuE3lGpOuUxSvT6VFOFJcvZ70VvYPDpZ7K+/1DW1Q9lq60zISlBDevuugOTN6ZEslnMYhaPDbsl9ueJYsr6U2a4kmKCkSu+R+uqcxhqPYARy9ravgye8ib6j3k+vjKPZKdEZOeEYEoRHAITFtLQplq0CFsmmFw7wsiGa5D2JNWeIdLFhzG07BhIkjKNwyxmMYvHgicFUekixDBcjFeKyfu5+wf/yIK1t5OJQQ47nYWnvg7fvwBM+rgTK7XLDG2iShLAeMGbvIyoFtQkIJZkR9o0i1nMYhfwpCIqngKCYouEVtKC9Tcw+uOzaXnL0pe/G+buH3UkBpAylcJjRZGh1tAWsBpIAPIUdYFgckR9DEST6sxfzmIWs9gFPKmIynQURVSWtka30tqwkYUHHUieOHIbozB3TKQwi1nM4smAJy1RmUr6pB7xGUp5KqCJYfez2o5ZzOLJiSctUekqV5FAIPqsGLWIlnkoZnUes5jFkxL/H/hb0Uomuft+AAAAAElFTkSuQmCC";

function groupContainerSizes(containers: any[]): string {
  const sizeCount: Record<string, number> = {};
  containers.forEach((c) => {
    const size = c.containerSize || "N/A";
    sizeCount[size] = (sizeCount[size] || 0) + 1;
  });
  return Object.entries(sizeCount)
    .map(([size, count]) => `${count} x ${size}`)
    .join(", ");
}

export async function generateCroPdf(
  shipmentId: number,
  selectedContainers: any[]
) {
  const doc = new jsPDF();

  try {
    const [shipmentRes, addressBooksRes, productsRes, inventoryRes] =
      await Promise.all([
        axios.get(`http://localhost:8000/shipment/${shipmentId}`),
        axios.get(`http://localhost:8000/addressbook`),
        axios.get(`http://localhost:8000/products`),
        axios.get(`http://localhost:8000/inventory`),
      ]);

    const shipment = shipmentRes.data;
    const addressBooks = addressBooksRes.data;
    const products = productsRes.data;
    const inventory = inventoryRes.data;

    const croNo = shipment.houseBL;
    const croDate = dayjs(shipment.date).format("DD-MMM-YYYY");
    const validTill = dayjs(shipment.date).add(7, "day").format("DD-MMM-YYYY");
    const customer = addressBooks.find(
      (ab: any) => ab.id === shipment.custAddressBookId
    );
    const customerName = customer?.companyName || "N/A";
    const portOfDischarge = shipment.transhipmentPortId
      ? shipment.transhipmentPort?.portName
      : shipment.podPort?.portName;
    const finalPortOfDischarge = shipment.podPort?.portName || "N/A";
    const carrier = addressBooks.find(
      (ab: any) => ab.id === shipment.carrierAddressBookId
    );
    const portOfLoading = shipment.polPort?.portName || "N/A";

    const vesselVoyage = `${carrier?.companyName || "N/A"} / ${
      shipment.vesselName || "N/A"
    }`;
    const vesselETD = dayjs(shipment.gsDate).format("DD-MMM-YYYY");
    const vesselETA = dayjs(shipment.etaTopod).format("DD-MMM-YYYY");
    const product = products.find((p: any) => p.id === shipment.productId);
    const productType = product?.productType || "N/A";

    // Add containerSize to each container
    const containersWithSize = selectedContainers.map((sc) => {
      const inv = inventory.find(
        (inv: any) => inv.containerNumber === sc.containerNumber
      );
      return {
        ...sc,
        containerSize: inv?.containerSize || "N/A",
      };
    });

    const groupedByDepot: Record<string, any[]> = {};
    containersWithSize.forEach((container) => {
      const depot = container.depotName || "Unknown Depot";
      if (!groupedByDepot[depot]) groupedByDepot[depot] = [];
      groupedByDepot[depot].push(container);
    });

    const depotNames = Object.keys(groupedByDepot);

    depotNames.forEach((depotName, index) => {
      if (index > 0) doc.addPage();

      const containers = groupedByDepot[depotName];
      const depot = addressBooks.find(
        (ab: any) => ab.companyName === depotName
      );
      const depotAddress = depot?.address || "N/A";
      const depotContact = depot?.contacts?.[0]
        ? `${depot.contacts[0].title} ${depot.contacts[0].firstName} ${depot.contacts[0].lastName} ${depot.phone}`
        : depot?.phone || "N/A";

      const containerTypeSummary = groupContainerSizes(containers);
      const containerNos = containers.map((c) => [c.containerNumber || "N/A"]);

      // --- HEADER ---
      doc.addImage(ristarLogoBase64, "PNG", 80, 10, 50, 20);
       doc.setFontSize(10);
      doc.setTextColor(36, 50, 96);
      doc.text("CONTAINER RELEASE ORDER", 75, 35);
      doc.setDrawColor(36, 50, 96);
      doc.setLineWidth(0.5);
      doc.line(10, 38, 200, 38);

      // --- INFO TABLE ---
      autoTable(doc, {
        startY: 45,
        styles: { fontSize: 10, cellPadding: 1.5 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 50 },
          1: { cellWidth: 70 },
          2: { fontStyle: "bold", cellWidth: 40 },
          3: { cellWidth: 40 },
        },

        body: [
          ["CRO No.", croNo, "Valid Till", validTill],
          ["CRO Date", croDate, "", ""],
          ["Pickup Depot Terminal Name", depotName, "", ""],
          ["Pickup Depot Terminal Address", depotAddress, "", ""],
          ["Pickup Depot Terminal Contact", depotContact, "", ""],
          ["Customer Name", customerName, "", ""],
          ["Port of Origin", portOfLoading, "", ""],
          ["Port of Loading", portOfLoading, "", ""],
          ["Port of Discharge", portOfDischarge, "", ""],
          ["Final Port of Discharge", finalPortOfDischarge, "", ""],
          ["Vessel / Voyage", vesselVoyage, "", ""],
          ["Vessel ETD", vesselETD, "", ""],
          ["Vessel ETA", vesselETA, "", ""],
            ["Container Type", containerTypeSummary, "", ""],     // 👈 consistent row
  ["Product Type", productType, "", ""],                // 👈 consistent row
        ],
        theme: "plain",
      
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 5,
        head: [["Container Nos."]],
        body: containerNos,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [1, 169, 150] },
      });

      
    });

    doc.save(`${croNo}_CRO.pdf`);
  } catch (err) {
    console.error("Error generating CRO PDF", err);
  }
}
