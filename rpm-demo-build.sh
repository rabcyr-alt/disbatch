dzil mkrpmspec
dzil build
cp `grep ^Source: dzil.spec | awk '{print $2}'` ~/rpmbuild/SOURCES/
mv dzil.spec ~/rpmbuild/SPECS/disbatch.spec
# set RPM_TARGET to build for another architecture, such as `RPM_TARGET=aarch64 ./rpm-demo-build.sh`. go-task-runner is built for
# it by Go, which cross compiles, so this does not need to be on that architecture
rpmbuild -ba ${RPM_TARGET:+--target "$RPM_TARGET"} ~/rpmbuild/SPECS/disbatch.spec
