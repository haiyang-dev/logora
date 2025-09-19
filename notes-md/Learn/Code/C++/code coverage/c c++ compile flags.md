https://stackoverflow.com/questions/28840261/gcov-what-is-the-difference-between-coverage-and-ftest-coverage-when-buildi

```javascript
AC_ARG_ENABLE(coverage,
AS_HELP_STRING([--enable-coverage],
               [enable unit test coverage generated, default: no]),
[case "${enableval}" in
  yes) coverage=true ;;
  no)  coverage=false ;;
  *) AC_MSG_ERROR([bad value ${enableval} for --enable-coverage]) ;;
esac],
[coverage=false])

AM_CONDITIONAL(COVERAGE, test x"$coverage" = x"true")
```



```javascript
if test "$coverage" == true; then
CXXFLAGS="--coverage -g -msse4.2 -fno-builtin -std=c++11 -O0 -Wall -Wno-unknown-pragmas -DDEBUG -fPIC -fstack-protector -rdynamic -isystem "$QUANTUM_FRAMEWORK_DEPENDENCIES" -Wl,--no-undefined";
CFLAGS="--coverage -g -fno-builtin -O0 -DDEBUG -fPIC -Wall -fstack-protector -Wno-unknown-pragmas";
```



```javascript
#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ([2.60])
AC_INIT([QUANTUM_FRAMEWORK], [2.1], [quantumframeworkteam@thomson.com])
AC_CONFIG_AUX_DIR([build-aux])
AC_CONFIG_MACRO_DIR([m4])
AC_PREFIX_DEFAULT(["/data/ThomsonReuters/quantum_framework"])
AM_INIT_AUTOMAKE([-Wall -Werror foreign])
AC_CONFIG_SRCDIR([Components/VACache])
AC_CONFIG_HEADERS([config.h])
m4_ifdef([AM_PROG_AR],[AM_PROG_AR])
LT_INIT([disable-static])
AC_DISABLE_STATIC
AC_ARG_ENABLE(debug,
AS_HELP_STRING([--enable-debug],
               [enable debugging, default: no]),
[case "${enableval}" in
             yes) debug=true ;;
             no)  debug=false ;;
             *)   AC_MSG_ERROR([bad value ${enableval} for --enable-debug]) ;;
esac],
[debug=false])

AM_CONDITIONAL(DEBUG, test x"$debug" = x"true")

AC_ARG_ENABLE(coverage,
AS_HELP_STRING([--enable-coverage],
               [enable unit test coverage generated, default: no]),
[case "${enableval}" in
  yes) coverage=true ;;
  no)  coverage=false ;;
  *) AC_MSG_ERROR([bad value ${enableval} for --enable-coverage]) ;;
esac],
[coverage=false])

AM_CONDITIONAL(COVERAGE, test x"$coverage" = x"true")

AC_ARG_ENABLE(unittest,
AS_HELP_STRING([--enable-unittest],
               [enable unit testing, default: no]),
[case "${enableval}" in
  yes) unittest=true ;;
  no)  unittest=false ;;
  *) AC_MSG_ERROR([bad value ${enableval} for --enable-unittest]) ;;
esac],
[unittest=false])

AM_CONDITIONAL(UNITTEST, test x"$unittest" = x"true")

AC_ARG_ENABLE(dlink,
AS_HELP_STRING([--enable-dlink],
               [enable shared lib, default: no]),
[case "${enableval}" in
  yes) dlink=true ;;
  no)  dlink=false ;;
  *) AC_MSG_ERROR([bad value ${enableval} for --enable-dlink]) ;;
esac],
[dlink=false])

AM_CONDITIONAL(DLINK, test x"$dlink" = x"true")


AC_ARG_ENABLE(gprofiler,
AS_HELP_STRING([--enable-gprofiler],
               [enable google profiler, default: no]),
[case "${enableval}" in
  yes) gprofiler=true ;;
  no)  gprofiler=false ;;
  *) AC_MSG_ERROR([bad value ${enableval} for --enable-gprofiler]) ;;
esac],
[gprofiler=false])

AM_CONDITIONAL(GPROFILER, test x"$gprofiler" = x"true")

AC_ARG_ENABLE(tcmalloc,
AS_HELP_STRING([--enable-tcmalloc],
               [enable tcmalloc, default: no]),
[case "${enableval}" in
  yes) tcmalloc=true ;;
  no)  tcmalloc=false ;;
  *) AC_MSG_ERROR([bad value ${enableval} for --enable-tcmalloc]) ;;
esac],
[tcmalloc=false])

AC_ARG_VAR(QUANTUM_FRAMEWORK_DEPENDENCIES, "Absolute Path to the Quantum Framework Dependencies")
AC_ARG_VAR(QUANTUM_FRAMEWORK_DIR, "Absolute Path to the Quantum Framework SourceCode")

AC_ARG_VAR(MARCH, "Architecture to use, used as -march flag when compiling [Default = core2]")
AS_IF([test "x$MARCH" = x], [MARCH="core2"])

AM_CONDITIONAL(TCMALLOC, test x"$tcmalloc" = x"true")
if test "$tcmalloc" == true; then
TCMALLOCLIB="-ltcmalloc"
else
TCMALLOCLIB=""
fi

TSNL_DIR=/opt/tsnl

if test "$coverage" == true; then
CXXFLAGS="--coverage -g -msse4.2 -fno-builtin -std=c++11 -O0 -Wall -Wno-unknown-pragmas -DDEBUG -fPIC -fstack-protector -rdynamic -isystem "$QUANTUM_FRAMEWORK_DEPENDENCIES" -Wl,--no-undefined";
CFLAGS="--coverage -g -fno-builtin -O0 -DDEBUG -fPIC -Wall -fstack-protector -Wno-unknown-pragmas";
else 
if test "$debug" == true; then
CXXFLAGS="-gdwarf-2 -g3 -msse4.2 -fno-builtin -std=c++11 -O0 -Wall -Wno-unknown-pragmas -DDEBUG -fPIC -fstack-protector -rdynamic -isystem "$QUANTUM_FRAMEWORK_DEPENDENCIES" -Wl,--no-undefined";
CFLAGS="-gdwarf-2 -g3 -fno-builtin -O0 -DDEBUG -fPIC -Wall -fstack-protector -Wno-unknown-pragmas";
else
CXXFLAGS="-std=c++11 -DNDEBUG -msse4.2 -Wall -Wno-unknown-pragmas -fPIC -fstack-protector -g -O2 -rdynamic \
-fno-schedule-insns2 \
-march="$MARCH" -isystem "$QUANTUM_FRAMEWORK_DEPENDENCIES" -Wl,--no-undefined $CXXFLAGS";
CFLAGS="-fPIC -march="$MARCH" -fstack-protector -Wall -Wno-unknown-pragmas $CFLAGS";
fi
fi

if test "$gprofiler" == true; then
AC_CHECK_LIB(profiler, ProfilerStart, [],[echo "Google profiler isn't installed.";exit 1;])
CXXFLAGS="-DGPROFILER $CXXFLAGS";
CFLAGS="-DGROFILER $CFLAGS";
fi

CXXFLAGS+=" -I"$QUANTUM_FRAMEWORK_DIR/Includes" -I"$QUANTUM_FRAMEWORK_DIR/Interfaces" -I"$QUANTUM_FRAMEWORK_DEPENDENCIES" -DLinux -Dlinux -pthread"

# Checks for programs.
AC_PROG_CXX
#AC_PROG_CC
# Checks for libraries.
# Check Quantum Dependencies Lib

AC_CHECK_FILES(["$QUANTUM_FRAMEWORK_DEPENDENCIES"/boost/version.hpp],[FOUND_DEPEND=1;],[FOUND_DEPEND=0;])

if test $FOUND_DEPEND != 1; then
    AC_MSG_NOTICE([])
    AC_MSG_NOTICE([The Quantum Dependencies Directory was not found!])
    AC_MSG_NOTICE([])
    AC_MSG_ERROR([Quantum Dependencies must be present : cannot build and stop here !])
fi

# Checks for header files.
AC_CHECK_HEADERS([fcntl.h float.h memory.h stdlib.h string.h unistd.h wchar.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_HEADER_STDBOOL
AC_C_INLINE
AC_TYPE_SIZE_T

# Checks for library functions.
AC_FUNC_ERROR_AT_LINE
AC_FUNC_MALLOC
AC_FUNC_REALLOC
AC_CHECK_FUNCS([inet_ntoa memmove memset socket strchr strtol])


#distribute addtional compile and linker flags among Makefiles
AC_SUBST([AM_CXXFLAGS])
AC_SUBST([AM_LDFLAGS])
AC_SUBST([AM_CFLAGS])
AC_SUBST([TCMALLOCLIB])
AC_SUBST([TSNL_DIR])

#file to generate via autotools
AC_CONFIG_FILES([Makefile])
AC_CONFIG_FILES([Components/ReplayLib/Makefile])
AC_CONFIG_FILES([Components/VACache/Makefile])
AC_CONFIG_FILES([Components/RAConsumer/Makefile])
AC_CONFIG_FILES([Components/SSConsumer/Makefile])
AC_CONFIG_FILES([Components/DataOut/Makefile])
AC_CONFIG_FILES([Components/SnapshotResponseDecoder/Makefile])
AC_CONFIG_FILES([Components/SnapshotServiceClient/Makefile])
AC_CONFIG_FILES([Components/SnapshotDispatcher/Makefile])
AC_CONFIG_FILES([Components/StatsProvider/Makefile])
AC_CONFIG_FILES([Components/RWFEncoder/Makefile])
AC_CONFIG_FILES([Components/DataReplayer/Makefile])

#UNIT TEST SECTION. Don't delete this line! It is an anchor for compwizard
if test "$unittest" == true; then
[echo "Unittests is enabled"]
AC_CONFIG_FILES([UnitTests/StatsProviderUnitTest/Makefile])
AC_CONFIG_FILES([UnitTests/VACacheUnitTest/Makefile])
AC_CONFIG_FILES([UnitTests/DataOutUnitTest/Makefile])
AC_CONFIG_FILES([UnitTests/RWFEncoderUnitTest/Makefile])
AC_CONFIG_FILES([UnitTests/SSConsumerUnitTest/Makefile])
AC_CONFIG_FILES([UnitTests/SnapshotDispatcherUnitTest/Makefile])
fi

AC_OUTPUT

```

